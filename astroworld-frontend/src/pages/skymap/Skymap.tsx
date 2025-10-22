import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { StellariumEngine, StellariumObject, CoordinateInfo } from '../../types/stellarium';
import StelButton from '../../components/Skymap/StelButton';
import Layout from '../../components/Layout';
import { getTitle, getInfos } from '../../utils/stellarium';
import { useSaveContent } from '../../hooks/useUserContent';
import { MarkerModal } from '../../components/Skymap/MarkerModal';
import { SaveViewButton } from '../../components/Skymap/SaveViewButton';
import MarkdownLite from '../../components/murphai/MarkdownLite';
import { MarkerOverlay } from '../../components/Skymap/MarkerOverlay';
import { 
  useSkyMarkers, 
  useCreateMarker, 
  useUpdateMarker, 
  useDeleteMarker, 
  useToggleMarkerTracking,
  useCreateView,
  useGenerateAIDescription,
  type SkyMarker,
  type CreateMarkerData,
  type CreateViewData
} from '../../hooks/useSkymap';
import { Bookmark, BookmarkCheck, MapPin, Clock, Play, Pause, Plus } from 'lucide-react';

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

const Skymap: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [stel, setStel] = useState<StellariumEngine | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stellariumLoading, setStellariumLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTimeRunning, setIsTimeRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const [markerMode, setMarkerMode] = useState(false);
  const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false);
  const [editingMarker, setEditingMarker] = useState<SkyMarker | null>(null);
  const [pendingMarkerCoords, setPendingMarkerCoords] = useState<{ ra: number; dec: number; alt?: number; az?: number } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savedObjectId, setSavedObjectId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineInitialized = useRef(false);
  const timeUpdateInterval = useRef<number | null>(null);
  const clickTimeout = useRef<number | null>(null);
  
  const saveContent = useSaveContent();
  
  // Skymap API hooks
  const { data: markers = [] } = useSkyMarkers();
  const createMarkerMutation = useCreateMarker();
  const updateMarkerMutation = useUpdateMarker();
  const deleteMarkerMutation = useDeleteMarker();
  const toggleTrackingMutation = useToggleMarkerTracking();
  const createViewMutation = useCreateView();
  const generateAIMutation = useGenerateAIDescription();

  // Get user's geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        // Set observer location in Stellarium if engine is ready
        if (stel?.core) {
          try {
            stel.core.observer.utc_to_local_tz = 0; // Use UTC for consistency
            stel.core.observer.latitude = latitude * Math.PI / 180; // Convert to radians
            stel.core.observer.longitude = longitude * Math.PI / 180;
            stel.core.observer.elevation = 0; // Sea level default
            console.log(`Location set to: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } catch (error) {
            console.error('Failed to set observer location:', error);
          }
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown location error occurred');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [stel]);

  // Update Stellarium time
  const updateStellariumTime = useCallback((time?: Date) => {
    if (!stel?.core) return;
    
    const targetTime = time || new Date();
    try {
      // Convert to Julian Day (Stellarium's internal time format)
      const julianDay = targetTime.getTime() / 86400000 + 2440587.5;
      stel.core.observer.time = julianDay;
      setCurrentTime(targetTime);
    } catch (error) {
      console.error('Failed to update Stellarium time:', error);
    }
  }, [stel]);

  // Create marker from selected object
  const createMarkerFromObject = useCallback(async (obj: StellariumObject) => {
    if (!obj || !stel?.core) return;
    
    try {
      const objectName = getTitle(obj);
      const objectInfos = getInfos(stel, obj);
      console.log('Creating marker for object:', objectName);
      console.log('Raw object data:', obj);
      console.log('Object ICRS position:', obj.icrs_pos);
      console.log('Object coordinates:', obj.coordinates);
      
      // Extract object details automatically
      let az = 0, alt = 0, ra, dec;
      let magnitude, objectType = 'other';
      
      // Get celestial coordinates from the Stellarium object
      try {
        // Method 1: Use the same getInfos function that works for the UI
        const objectInfos = getInfos(stel, obj);
        console.log('Object infos from getInfos:', objectInfos);
        
        // Find Az/Alt from the object info array (they're combined in one field)
        const azAltInfo = objectInfos.find((info: CoordinateInfo) =>
          info && info.key && (
            info.key.toLowerCase().includes('az') ||
            info.key.toLowerCase().includes('alt') ||
            info.key.toLowerCase().includes('az/alt')
          )
        );

        console.log('Found Az/Alt info:', azAltInfo);

        if (azAltInfo && azAltInfo.value) {
          // Parse Az/Alt from the combined HTML string
          const combinedText = azAltInfo.value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
          console.log('Combined Az/Alt text:', combinedText);

          // Split on the + sign to separate Az and Alt
          const parts = combinedText.split('+');
          if (parts.length >= 2) {
            const azPart = parts[0].trim();
            const altPart = '+' + parts[1].trim();

            console.log('Az part:', azPart);
            console.log('Alt part:', altPart);

            // Parse Az (format: "359° 22' 08.1\"")
            const azMatch = azPart.match(/(\d+(?:\.\d+)?)\s*°?\s*(\d+(?:\.\d+)?)?\s*'?\s*(\d+(?:\.\d+)?)?\s*"?/);
            if (azMatch) {
              const degrees = parseFloat(azMatch[1] || '0');
              const minutes = parseFloat(azMatch[2] || '0');
              const seconds = parseFloat(azMatch[3] || '0');
              console.log('Az parsing - degrees:', degrees, 'minutes:', minutes, 'seconds:', seconds);
              az = degrees + (minutes / 60) + (seconds / 3600);
              console.log('Az result:', az);
            }

            // Parse Alt (format: "+25° 21' 32.0\"")
            const altMatch = altPart.match(/([+-]?\d+(?:\.\d+)?)\s*°?\s*(\d+(?:\.\d+)?)?\s*'?\s*(\d+(?:\.\d+)?)?\s*"?/);
            if (altMatch) {
              const degrees = parseFloat(altMatch[1] || '0');
              const minutes = parseFloat(altMatch[2] || '0');
              const seconds = parseFloat(altMatch[3] || '0');
              console.log('Alt parsing - degrees:', degrees, 'minutes:', minutes, 'seconds:', seconds);
              alt = Math.abs(degrees) + (minutes / 60) + (seconds / 3600);
              if (degrees < 0) alt = -alt;
              console.log('Alt result:', alt);
            }

            console.log('Parsed Az/Alt from combined string - Az:', az, 'Alt:', alt);
          }
        }
        
        // Method 2: Fallback - try to access horizontal_pos property directly
        if ((az === 0 && alt === 0)) {
          let horizontalCoords = null;
          try {
            if (typeof obj.horizontal_pos === 'function') {
              horizontalCoords = obj.horizontal_pos();
              console.log('Horizontal coordinates from function call:', horizontalCoords);
            } else {
              horizontalCoords = obj.horizontal_pos;
              console.log('Horizontal coordinates from property:', horizontalCoords);
            }
          } catch (horizontalError) {
            console.warn('Error accessing horizontal_pos:', horizontalError);
          }
          
          if (horizontalCoords && Array.isArray(horizontalCoords) && horizontalCoords.length >= 2) {
            // Horizontal coordinates are typically [azimuth, altitude] in radians
            az = horizontalCoords[0] * 180 / Math.PI; // Convert to degrees
            alt = horizontalCoords[1] * 180 / Math.PI;
            
            console.log('Extracted from horizontal_pos array - Az:', az, 'Alt:', alt);
          }
        }
        
        // Method 3: Try to access jsonData which might contain coordinates
        if ((ra === 0 && dec === 0) && obj.jsonData) {
          try {
            const jsonData = typeof obj.jsonData === 'function' ? obj.jsonData() : obj.jsonData;
            console.log('JSON data:', jsonData);
            
            if (jsonData && typeof jsonData === 'object') {
              if (jsonData.ra !== undefined && jsonData.dec !== undefined) {
                ra = parseFloat(jsonData.ra);
                dec = parseFloat(jsonData.dec);
                console.log('Extracted from jsonData - RA:', ra, 'Dec:', dec);
              }
            }
          } catch (jsonError) {
            console.warn('Error accessing jsonData:', jsonError);
          }
        }
        
      } catch (error) {
        console.error('Error extracting coordinates:', error);
      }
      
      console.log('Final coordinates - Az:', az, 'Alt:', alt);
      
      // Get altitude and azimuth if available
      if (obj.horizontal_pos) {
        if (typeof obj.horizontal_pos === 'object' && 'alt' in obj.horizontal_pos && 'az' in obj.horizontal_pos) {
          alt = obj.horizontal_pos.alt * 180 / Math.PI;
          az = obj.horizontal_pos.az * 180 / Math.PI;
        }
      }
      
      // Extract magnitude from object info
      const magInfo = objectInfos.find(info => 
        info.key.toLowerCase().includes('magnitude') || 
        info.key.toLowerCase().includes('mag')
      );
      if (magInfo) {
        const magValue = magInfo.value.replace(/<[^>]*>/g, '').trim();
        magnitude = parseFloat(magValue) || undefined;
      }
      
      // Determine object type from Stellarium object type
      if (obj.type) {
        const stellariumType = obj.type.toLowerCase();
        if (stellariumType.includes('star')) objectType = 'star';
        else if (stellariumType.includes('planet')) objectType = 'planet';
        else if (stellariumType.includes('moon')) objectType = 'moon';
        else if (stellariumType.includes('galaxy')) objectType = 'galaxy';
        else if (stellariumType.includes('nebula')) objectType = 'nebula';
        else if (stellariumType.includes('constellation')) objectType = 'constellation';
        else if (stellariumType.includes('asteroid')) objectType = 'asteroid';
        else if (stellariumType.includes('comet')) objectType = 'comet';
        else if (stellariumType.includes('satellite')) objectType = 'satellite';
        else if (stellariumType.includes('iss')) objectType = 'iss';
        else if (stellariumType.includes('cluster') || stellariumType.includes('open cluster') || stellariumType.includes('globular cluster')) objectType = 'cluster';
        else if (stellariumType.includes('deep') || stellariumType.includes('dso')) objectType = 'deep_sky';
        // Keep 'other' as default for unrecognized types
      }
      
      // Get object ID from various sources - create a consistent identifier
      const designation = obj.designation || obj.catalog_number || obj.name;
      const catalogNumber = obj.catalog_number || obj.designation;
      const stellariumType = obj.type;
      
      // Create a unique object identifier using multiple properties
      // This ensures consistent identification across different contexts
      let objectIdentifier = [
        designation,
        obj.name,
        stellariumType,
        obj.icrs_pos ? `${obj.icrs_pos.ra?.toFixed(3)}_${obj.icrs_pos.dec?.toFixed(3)}` : null
      ].filter(Boolean).join('|').substring(0, 200); // Limit to 200 chars
      
      // Ensure object_id is never empty - fallback to timestamp-based unique ID
      if (!objectIdentifier || objectIdentifier.trim() === '') {
        objectIdentifier = `stellarium_object_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Create object metadata for additional identification
      const objectMetadata = {
        designation: obj.designation,
        catalog_number: obj.catalog_number,
        name: obj.name,
        type: obj.type,
        magnitude: obj.magnitude,
        // Store basic coordinate info as simple values
        ra_deg: obj.icrs_pos?.ra ? obj.icrs_pos.ra * 180 / Math.PI : null,
        dec_deg: obj.icrs_pos?.dec ? obj.icrs_pos.dec * 180 / Math.PI : null,
        alt_deg: (obj.horizontal_pos && typeof obj.horizontal_pos === 'object' && 'alt' in obj.horizontal_pos) ? obj.horizontal_pos.alt * 180 / Math.PI : null,
        az_deg: (obj.horizontal_pos && typeof obj.horizontal_pos === 'object' && 'az' in obj.horizontal_pos) ? obj.horizontal_pos.az * 180 / Math.PI : null
      };
      
      // Create object notes from Stellarium info
      const notes = objectInfos
        .slice(0, 3) // Take first 3 info items
        .map(info => `${info.key}: ${info.value.replace(/<[^>]*>/g, '')}`)
        .join('\n');
      
      // Auto-create the marker directly with extracted data
      const markerData = {
        name: objectName,
        object_type: objectType,
        object_id: objectIdentifier, // Use the consistent identifier
        designation: designation,
        catalog_number: catalogNumber,
        stellarium_type: stellariumType,
        object_metadata: objectMetadata,
        ra: 0, // Placeholder since we're using Az/Alt
        dec: 0, // Placeholder since we're using Az/Alt
        alt,
        az,
        magnitude,
        notes: notes || `Marked from Skymap on ${new Date().toLocaleDateString()}`,
        tags: ['skymap', objectType],
        color: '#3B82F6', // Default blue
        is_public: false,
        visibility_rating: magnitude !== undefined && magnitude !== null ? Math.max(1, Math.min(5, Math.round(6 - magnitude))) : undefined
      };
      
      // Create marker directly without modal
      createMarkerMutation.mutate(markerData);
      
      setMarkerMode(false); // Exit marker mode
      
    } catch (error) {
      console.error('Error creating marker:', error);
    }
  }, [stel, createMarkerMutation]);

  // Handle object selection and interaction
  const handleCanvasClick = useCallback((event: MouseEvent) => {
    console.log('=== CANVAS CLICK DETECTED ===');
    console.log('Event:', event);
    console.log('Canvas ref exists:', !!canvasRef.current);
    console.log('Stellarium core exists:', !!stel?.core);
    console.log('Stellarium loading:', stellariumLoading);

    if (stellariumLoading) {
      console.log('Stellarium is still loading... Please wait for initialization to complete.');
      return;
    }

    if (!stel?.core || !canvasRef.current) {
      console.log('Early return: missing stellarium core or canvas ref');
      return;
    }

    // Clear any existing click timeout
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
    }

    // Get canvas coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log('Canvas coordinates:', { x, y });
    console.log('Canvas rect:', rect);

    // Convert to normalized canvas coordinates (0-1)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    console.log('Normalized coordinates:', { normalizedX, normalizedY });

    // Convert to Stellarium coordinate system
    const stellariumX = normalizedX * 2 - 1;
    const stellariumY = 1 - normalizedY * 2;

    console.log('Stellarium coordinates:', { stellariumX, stellariumY });

    try {
      // Try to get object at coordinates (this might need adjustment based on Stellarium API)
      console.log('Calling getObjAtPos with:', { stellariumX, stellariumY });
      const obj = stel.core.getObjAtPos?.(stellariumX, stellariumY);

      console.log('getObjAtPos result:', obj);

      if (obj) {
        // Set as selected object
        stel.core.selection = obj;

        // Console log the full object structure
        console.log('=== SELECTED STELLARIUM OBJECT ===');
        console.log('Full object:', obj);
        console.log('Object keys:', Object.keys(obj));
        console.log('Object type:', obj.type);
        console.log('Object designation:', obj.designation);
        console.log('Object catalog_number:', obj.catalog_number);
        console.log('Object name:', obj.name);
        console.log('Object icrs_pos:', obj.icrs_pos);
        console.log('Object coordinates:', obj.coordinates);
        console.log('Object horizontal_pos:', obj.horizontal_pos);
        console.log('Object magnitude:', obj.magnitude);
        console.log('==================================');

        
        // If in marker mode, create a marker
        if (markerMode) {
          createMarkerFromObject(obj);
        }
      } else {
        console.log('No object found at coordinates');
        // Clear selection
        stel.core.selection = null;

      }
    } catch (error) {
      console.error('Failed to handle canvas click:', error);
    }
  }, [stel, markerMode, stellariumLoading, createMarkerFromObject]);

  // Marker management handlers
  const handleCreateMarker = (data: CreateMarkerData) => {
    createMarkerMutation.mutate(data, {
      onSuccess: () => {
        setIsMarkerModalOpen(false);
        setPendingMarkerCoords(null);
      }
    });
  };

  const handleEditMarker = (marker: SkyMarker) => {
    setEditingMarker(marker);
    setIsMarkerModalOpen(true);
  };

  const handleUpdateMarker = (data: Partial<SkyMarker>) => {
    if (editingMarker) {
      updateMarkerMutation.mutate(
        { markerId: editingMarker.id, data },
        {
          onSuccess: () => {
            setIsMarkerModalOpen(false);
            setEditingMarker(null);
          }
        }
      );
    }
  };

  const handleDeleteMarker = (markerId: number) => {
    if (confirm('Are you sure you want to delete this marker?')) {
      deleteMarkerMutation.mutate(markerId);
      setSelectedMarkerId(null);
    }
  };

  const handleToggleTracking = (markerId: number) => {
    toggleTrackingMutation.mutate(markerId);
  };

  const handleMarkerClick = (marker: SkyMarker) => {
    setSelectedMarkerId(marker.id);
    // Center the view on the clicked marker with animation
    // Use Az/Alt if available, otherwise fall back to RA/Dec
    if (marker.az !== undefined && marker.alt !== undefined) {
      navigateToCoordinates(marker.az, marker.alt, 8, 'horizontal');
    } else {
      navigateToCoordinates(marker.ra, marker.dec, 8, 'equatorial');
    }
    console.log('Centering on marker:', marker.display_name, { ra: marker.ra, dec: marker.dec, az: marker.az, alt: marker.alt });
  };

  const handleSaveView = (data: CreateViewData) => {
    // Get current view state from Stellarium
    if (stel?.core) {
      const currentViewData = {
        ...data,
        // Add current Stellarium state
        stellarium_settings: {
          // Add Stellarium settings as needed
        }
      };
      createViewMutation.mutate(currentViewData);
    }
  };

  const handleGenerateAIDescription = async () => {
    if (!stel?.core?.selection) {
      setAiError('No celestial object selected');
      return;
    }
    
    setAiError(null);
    setAiDescription(null);
    
    const objectName = getTitle(stel.core.selection);
    const objectInfos = getInfos(stel, stel.core.selection);
    
    // Create a detailed prompt for Murph AI
    const contextInfo = objectInfos
      .map(info => `${info.key}: ${info.value.replace(/<[^>]*>/g, '')}`)
      .join(', ');
    
    const prompt = `Please provide a brief astronomical description of ${objectName}. Context: ${contextInfo}`;
    
    generateAIMutation.mutate({
      object_name: objectName,
      object_type: stel.core.selection?.type || 'celestial',
      coordinates: stel.core.selection?.icrs_pos ? {
        ra: stel.core.selection.icrs_pos.ra * 180 / Math.PI,
        dec: stel.core.selection.icrs_pos.dec * 180 / Math.PI
      } : undefined,
      additional_context: prompt
    }, {
      onSuccess: (data) => {
        setAiDescription(data.description);
        setAiError(null);
      },
      onError: (error) => {
        setAiError(error instanceof Error ? error.message : 'Failed to generate AI description');
        setAiDescription(null);
      }
    });
  };

  // Navigate to specific coordinates with animation
  const navigateToCoordinates = useCallback((coord1: number, coord2: number, zoom = 4, system: 'equatorial' | 'horizontal' = 'equatorial') => {
    if (!stel?.core) return;

    try {
      let targetPos: number[];

      if (system === 'horizontal') {
        // Convert Az/Alt to RA/Dec first, then to Cartesian
        // This is needed because Stellarium's projection expects equatorial coordinates
        // For now, approximate by assuming the object is at the local zenith when alt=90
        const ra = coord1; // Simplified: azimuth becomes RA
        const dec = coord2; // Simplified: altitude becomes Dec

        const raRad = ra * Math.PI / 180;
        const decRad = dec * Math.PI / 180;

        targetPos = [
          Math.cos(decRad) * Math.cos(raRad),
          Math.cos(decRad) * Math.sin(raRad),
          Math.sin(decRad)
        ];
      } else {
        // RA/Dec coordinates - convert to Cartesian
        const raRad = coord1 * Math.PI / 180;
        const decRad = coord2 * Math.PI / 180;

        // Convert equatorial coordinates to 3D Cartesian (ICRS)
        targetPos = [
          Math.cos(decRad) * Math.cos(raRad),
          Math.cos(decRad) * Math.sin(raRad),
          Math.sin(decRad)
        ];
      }

      // Smooth animation to target position
      if (stel.core.observer) {
        // Try different navigation methods
        if (system === 'horizontal' && stel.core.observer.set_azimuthal) {
          // Try direct horizontal coordinate navigation if available
          try {
            stel.core.observer.set_azimuthal(coord1 * Math.PI / 180, coord2 * Math.PI / 180);
            console.log(`Used set_azimuthal for horizontal coordinates: ${coord1}°, ${coord2}°`);
          } catch (error) {
            console.warn('set_azimuthal failed, falling back to set_direction:', error);
            // Fall back to set_direction with converted coordinates
            if (stel.core.observer.set_direction) {
              stel.core.observer.set_direction(targetPos);
            }
          }
        } else if (stel.core.observer.set_direction) {
          // Set view direction to center on the object
          stel.core.observer.set_direction(targetPos);
        }

        // Set zoom level for better viewing
        if (stel.core.observer.set_zoom) {
          stel.core.observer.set_zoom(zoom);
        } else if (stel.core.observer.fov !== undefined) {
          // Alternative: set field of view
          stel.core.observer.fov = 60 / zoom; // Convert zoom to FOV
        }
      }      // Force a redraw to show the changes immediately
      if (typeof stel.core?.update === 'function') {
        stel.core.update(0);
      }

      console.log(`Navigated to ${system} coordinates: ${coord1}°, ${coord2}° with zoom: ${zoom}`);
    } catch (error) {
      console.error('Failed to navigate to coordinates:', error);
    }
  }, [stel]);

  // Handle URL parameters for navigation
  useEffect(() => {
    if (!stel?.core) return;

    const markerId = searchParams.get('marker');
    const ra = searchParams.get('ra');
    const dec = searchParams.get('dec');
    const az = searchParams.get('az');
    const alt = searchParams.get('alt');

    // Prioritize Az/Alt coordinates if available, otherwise use RA/Dec
    if ((az && alt) || (ra && dec)) {
      let coord1: number, coord2: number, system: 'horizontal' | 'equatorial';

      if (az && alt) {
        coord1 = parseFloat(az);
        coord2 = parseFloat(alt);
        system = 'horizontal';
      } else {
        coord1 = parseFloat(ra!);
        coord2 = parseFloat(dec!);
        system = 'equatorial';
      }

      if (!isNaN(coord1) && !isNaN(coord2)) {
        // Add a delay to ensure Stellarium is fully loaded
        setTimeout(() => {
          // Navigate with a higher zoom level to center and zoom in on the marker
          navigateToCoordinates(coord1, coord2, 8, system); // Increased zoom for better focus

          // If there's a marker ID, select it and add visual feedback
          if (markerId) {
            const markerIdNum = parseInt(markerId);
            if (!isNaN(markerIdNum)) {
              setSelectedMarkerId(markerIdNum);

              // Add a brief highlight animation for the selected marker
              setTimeout(() => {
                // Find the marker element and add a highlight class
                const markerElements = document.querySelectorAll('[data-marker-id]');
                markerElements.forEach((el) => {
                  const element = el as HTMLElement;
                  if (element.dataset.markerId === markerId) {
                    element.classList.add('marker-highlight');
                    setTimeout(() => {
                      element.classList.remove('marker-highlight');
                    }, 2000);
                  }
                });
              }, 1500); // Wait for navigation to complete
            }
          }
        }, 1000);
      }
    }
  }, [stel, searchParams, navigateToCoordinates]);

  // Toggle real-time updates
  const toggleTimeSync = () => {
    if (isTimeRunning) {
      // Stop real-time updates
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
      setIsTimeRunning(false);
    } else {
      // Start real-time updates
      updateStellariumTime(); // Update to current time
      timeUpdateInterval.current = window.setInterval(() => {
        updateStellariumTime();
      }, 5000); // Update every 5 seconds
      setIsTimeRunning(true);
    }
  };

  const handleSaveObject = async () => {
    if (!stel?.core.selection) return;
    
    try {
      const objectTitle = getTitle(stel.core.selection);
      const objectInfos = getInfos(stel, stel.core.selection);
      
      // Create a description from object infos
      const description = objectInfos
        .map(info => `${info.key}: ${info.value.replace(/<[^>]*>/g, '')}`)
        .join('\n');
      
      // Use object designation as content_id
      const designations = stel.core.selection.designations?.() || [];
      const contentId = designations[0] || objectTitle || 'unknown';
      
      await saveContent.mutateAsync({
        content_type: 'celestial',
        content_id: contentId,
        title: objectTitle,
        description: description,
        notes: `Saved from Skymap on ${new Date().toLocaleDateString()} - ${JSON.stringify(objectInfos)}`,
        tags: ['skymap', 'celestial']
      });
      
      setSavedObjectId(contentId);
    } catch (error) {
      console.error('Failed to save celestial object:', error);
    }
  };

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (engineInitialized.current || !canvasRef.current) return;
    engineInitialized.current = true;

    // Store canvas reference for cleanup
    const canvas = canvasRef.current;

    // Load required scripts
    const loadScripts = async () => {
      // Load Stellarium Web Engine
      const script3 = document.createElement('script');
      script3.src = '/astroworld-engine/stellarium-web-engine.js';
      document.head.appendChild(script3);

      await new Promise(resolve => script3.onload = resolve);

      // Initialize Stellarium Web Engine
      StelWebEngine({
        wasmFile: '/astroworld-engine/stellarium-web-engine.wasm',
        canvas: canvasRef.current!,
        // Simple fallback translation function that returns the string as-is
        translateFn: (_domain: string, str: string) => {
          return str; // Return the original string for now
        },
        onReady: (stellariumEngine: StellariumEngine) => {
          setStel(stellariumEngine);
          setStellariumLoading(false); // Mark as loaded
          
          // Add all data sources with corrected paths
          // Use local data from the public directory
          const baseUrl = '/data/test-skydata/';
          const core = stellariumEngine.core;

          core.stars.addDataSource({ url: baseUrl + 'stars' });
          core.skycultures.addDataSource({ url: baseUrl + 'skycultures/western', key: 'western' });
          core.dsos.addDataSource({ url: baseUrl + 'dso' });
          core.landscapes.addDataSource({ url: baseUrl + 'landscapes/guereins', key: 'guereins' });
          core.milkyway.addDataSource({ url: baseUrl + 'surveys/milkyway' });
          core.minor_planets.addDataSource({ url: baseUrl + 'mpcorb.dat', key: 'mpc_asteroids' });
          core.planets.addDataSource({ url: baseUrl + 'surveys/sso/moon', key: 'moon' });
          core.planets.addDataSource({ url: baseUrl + 'surveys/sso/sun', key: 'sun' });
          core.planets.addDataSource({ url: baseUrl + 'surveys/sso/moon', key: 'default' });
          core.comets.addDataSource({ url: baseUrl + 'CometEls.txt', key: 'mpc_comets' });
          core.satellites.addDataSource({ url: baseUrl + 'tle_satellite.jsonl.gz', key: 'jsonl/sat' });

          // Enable star name labels on the canvas
          if (core.stars) {
            console.log('Stars object properties:', Object.keys(core.stars));
            console.log('Stars object:', core.stars);

            // Try different approaches to enable star names
            if (typeof core.stars.names_visible !== 'undefined') {
              core.stars.names_visible = true;
            }
            if (typeof core.stars.designations_visible !== 'undefined') {
              core.stars.designations_visible = true;
            }
            if (typeof core.stars.proper_names_visible !== 'undefined') {
              core.stars.proper_names_visible = true;
            }
            if (typeof core.stars.labels_visible !== 'undefined') {
              core.stars.labels_visible = true;
            }
            if (typeof core.stars.show_names !== 'undefined') {
              core.stars.show_names = true;
            }

            // Set magnitude limits
            if (typeof core.stars.max_mag_names !== 'undefined') {
              core.stars.max_mag_names = 6.0;
            }
            if (typeof core.stars.mag_limit !== 'undefined') {
              core.stars.mag_limit = 6.0;
            }
          }  

          // Log constellation properties to check for images_visible
          if (core.constellations) {
            console.log('Constellation object properties:', Object.keys(core.constellations));
            console.log('Constellation object:', core.constellations);
          }

          // Set up real-time location and time
          requestLocation(); // Get user location
          updateStellariumTime(); // Set current time
          
          // Start real-time time updates
          if (isTimeRunning) {
            timeUpdateInterval.current = window.setInterval(() => {
              updateStellariumTime();
            }, 5000); // Update every 5 seconds
          }

          // Add canvas click event listener for object selection
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.addEventListener('click', handleCanvasClick);
          }

          // Force UI update when there is any change
          stellariumEngine.change((_obj: unknown, attr: string) => {
            if (attr !== "hovered") {
              // Force a complete re-render by updating the state
              setStel({ ...stellariumEngine });
            }
          });
        }
      });
    };

    loadScripts().catch(console.error);

    // Cleanup
    return () => {
      // Clear intervals
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }
      
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [requestLocation, updateStellariumTime, handleCanvasClick, isTimeRunning]);

  return (
    <Layout
      showLoginButton={false}
      isFullscreen={isFullscreen}
      mainClassName="pt-16 h-screen relative"
      footer={
        <footer className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl px-6 py-3">
            <div className="flex items-center justify-center space-x-2">
              <StelButton
                label="Constellations"
                img="/static/imgs/symbols/btn-cst-lines.svg"
                obj={stel?.core.constellations || null}
                attr="lines_visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Constellation Art"
                img="/static/imgs/symbols/btn-constellation-names.svg"
                obj={stel?.core.constellations || null}
                attr="images_visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Atmosphere"
                img="/static/imgs/symbols/btn-atmosphere.svg"
                obj={stel?.core.atmosphere || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Landscape"
                img="/static/imgs/symbols/btn-landscape.svg"
                obj={stel?.core.landscapes || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Azimuthal Grid"
                img="/static/imgs/symbols/btn-azimuthal-grid.svg"
                obj={stel?.core.lines.azimuthal || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Equatorial Grid"
                img="/static/imgs/symbols/btn-equatorial-grid.svg"
                obj={stel?.core.lines.equatorial || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Nebulae"
                img="/static/imgs/symbols/btn-nebulae.svg"
                obj={stel?.core.dsos || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="DSS"
                img="/static/imgs/symbols/btn-nebulae.svg"
                obj={stel?.core.dss || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              
              {/* Real-time Controls */}
              <button
                onClick={toggleTimeSync}
                className="group relative w-16 h-16 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-200"
                title={isTimeRunning ? "Pause Real-time" : "Resume Real-time"}
              >
                {isTimeRunning ? (
                  <Pause className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                ) : (
                  <Play className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                )}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {isTimeRunning ? "Pause Time" : "Resume Time"}
                </div>
              </button>
              
              <div className="w-px h-12 bg-gray-700/50" />
              
              {/* Location Control */}
              <button
                onClick={requestLocation}
                className={`group relative w-16 h-16 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-200 ${
                  userLocation ? 'text-green-400' : locationError ? 'text-red-400' : 'text-gray-300'
                }`}
                title="Update Location"
              >
                <MapPin className="w-5 h-5 group-hover:text-white transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {userLocation ? `Located: ${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}` : 
                   locationError ? locationError : 'Get Location'}
                </div>
              </button>
              
              <div className="w-px h-12 bg-gray-700/50" />
              
              {/* Time Display */}
              <div className="group relative w-24 h-16 flex flex-col items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-200">
                <Clock className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors mb-1" />
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Current Time: {currentTime.toLocaleString()}
                </div>
              </div>
              
              <div className="w-px h-12 bg-gray-700/50" />
              
              {/* Marker Mode Toggle */}
              <button
                onClick={() => setMarkerMode(!markerMode)}
                className={`group relative w-16 h-16 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  markerMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'hover:bg-white/10 text-gray-300'
                }`}
                title={markerMode ? "Exit Marker Mode" : "Enter Marker Mode"}
              >
                <svg className="w-5 h-5 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {markerMode ? "Exit Marker Mode" : "Click objects to mark them"}
                </div>
              </button>
              
              <div className="w-px h-12 bg-gray-700/50" />
              
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="group relative w-16 h-16 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-200"
                title="Enter Fullscreen"
              >
                <svg className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Fullscreen
                </div>
              </button>
            </div>
          </div>
        </footer>
      }
    >
        <canvas
          ref={canvasRef}
          id="stel-canvas"
          className="absolute inset-0 w-full h-full"
        />

        {/* Loading Overlay */}
        {stellariumLoading && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <h3 className="text-white text-lg font-semibold mb-2">Loading Stellarium</h3>
              <p className="text-gray-300 text-sm">Initializing celestial objects and data...</p>
            </div>
          </div>
        )}

        {/* Selection Info Card */}
        {(() => {
          const hasSelection = stel && stel.core.selection;

          if (hasSelection) {
            return (
              <div
                className="absolute top-20 left-4 w-96 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-white"
                style={{ zIndex: 1000 }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {getTitle(stel.core.selection)}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Create Marker Button */}
                      {(() => {
                        // Check if this object is already marked using structured identification fields
                        const currentDesignation = stel.core.selection?.designation || stel.core.selection?.catalog_number || getTitle(stel.core.selection);
                        const currentCatalogNumber = stel.core.selection?.catalog_number || stel.core.selection?.designation;
                        const currentStellariumType = stel.core.selection?.type;
                        const currentName = getTitle(stel.core.selection);
                        
                        // Check if any marker matches this object using multiple identification criteria
                        const isMarked = markers.some((m: SkyMarker) => {
                          // Primary check: exact designation match
                          if (m.designation && currentDesignation && m.designation === currentDesignation) {
                            return true;
                          }
                          
                          // Secondary check: catalog number match
                          if (m.catalog_number && currentCatalogNumber && m.catalog_number === currentCatalogNumber) {
                            return true;
                          }
                          
                          // Tertiary check: combination of name and type (for objects without formal designations)
                          if (m.stellarium_type === currentStellariumType && m.name === currentName) {
                            return true;
                          }
                          
                          // Fallback: check object_metadata for additional identification
                          if (m.object_metadata) {
                            const metadata = m.object_metadata;
                            // Check if any designation in metadata matches
                            if (metadata.designations && Array.isArray(metadata.designations)) {
                              const hasMatchingDesignation = metadata.designations.some((d: string) => 
                                d === currentDesignation || d === currentCatalogNumber
                              );
                              if (hasMatchingDesignation) return true;
                            }
                            
                            // Check ICRS position match (for precise coordinate-based identification)
                            if (metadata.icrs_pos && stel.core.selection?.icrs_pos && typeof metadata.icrs_pos === 'object') {
                              const icrsPos = metadata.icrs_pos as { ra?: number; dec?: number };
                              const markerRa = icrsPos.ra?.toFixed(6);
                              const markerDec = icrsPos.dec?.toFixed(6);
                              const currentRa = stel.core.selection.icrs_pos.ra?.toFixed(6);
                              const currentDec = stel.core.selection.icrs_pos.dec?.toFixed(6);
                              
                              if (markerRa === currentRa && markerDec === currentDec) {
                                return true;
                              }
                            }
                          }
                          
                          return false;
                        });
                        
                        return (
                          <button
                            onClick={() => stel.core.selection && createMarkerFromObject(stel.core.selection)}
                            disabled={isMarked || createMarkerMutation.isPending}
                            className={`flex items-center gap-1 px-2 py-1.5 text-white text-xs rounded transition-colors ${
                              isMarked 
                                ? 'bg-green-600 cursor-not-allowed' 
                                : createMarkerMutation.isPending
                                ? 'bg-gray-600 cursor-wait'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            title={isMarked ? "Already marked" : "Create marker for this object"}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              {isMarked ? (
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                              ) : (
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              )}
                            </svg>
                            {createMarkerMutation.isPending ? 'Marking...' : isMarked ? 'Marked' : 'Mark'}
                          </button>
                        );
                      })()}
                      
                      {/* Save to Content Button */}
                      <button
                        onClick={handleSaveObject}
                        disabled={saveContent.isPending}
                        className="flex items-center gap-1 px-2 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs rounded transition-colors"
                        title="Save this celestial object"
                      >
                        {savedObjectId ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                        {saveContent.isPending ? 'Saving...' : savedObjectId ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Object Information */}
                  <div className="space-y-2 mb-4">
                    {(() => {
                      try {
                        return getInfos(stel, stel.core.selection).map((info, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2">
                            <div className="text-gray-300 text-sm">{info.key}</div>
                            <div
                              className="col-span-2 text-sm font-medium text-white"
                              dangerouslySetInnerHTML={{ __html: info.value }}
                            />
                          </div>
                        ));
                      } catch (error) {
                        console.error('Error getting infos:', error);
                        return <div className="text-red-400 text-sm">Error loading object info</div>;
                      }
                    })()}
                  </div>
                  
                  {/* AI Description Section */}
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-300">AI Description</h4>
                      <div className="flex gap-2">
                        {(aiDescription || aiError) && (
                          <button
                            onClick={() => {
                              setAiDescription(null);
                              setAiError(null);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          onClick={handleGenerateAIDescription}
                          disabled={generateAIMutation.isPending}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                        >
                          {generateAIMutation.isPending ? 'Loading...' : 'Generate'}
                        </button>
                      </div>
                    </div>
                    
                    {/* AI Description Content */}
                    {aiDescription ? (
                      <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                        <MarkdownLite text={aiDescription} />
                      </div>
                    ) : aiError ? (
                      <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg">
                        <div className="font-medium mb-1">Error:</div>
                        {aiError}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        Click "Generate" to get an AI-powered description of this celestial object.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })()}
        
        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
          {/* Real-time Status */}
          <div className={`px-3 py-2 rounded-lg backdrop-blur-sm border text-xs font-medium ${
            isTimeRunning 
              ? 'bg-green-900/50 border-green-500/50 text-green-300' 
              : 'bg-gray-900/50 border-gray-500/50 text-gray-300'
          }`}>
            <div className="flex items-center gap-2">
              {isTimeRunning ? (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              )}
              {isTimeRunning ? 'Real-time' : 'Paused'}
            </div>
          </div>
          
          {/* Location Status */}
          {userLocation && (
            <div className="px-3 py-2 rounded-lg backdrop-blur-sm border bg-blue-900/50 border-blue-500/50 text-blue-300 text-xs font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Located
              </div>
            </div>
          )}
          
          {/* Marker Mode Status */}
          {markerMode && (
            <div className="px-3 py-2 rounded-lg backdrop-blur-sm border bg-purple-900/50 border-purple-500/50 text-purple-300 text-xs font-medium">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Marker Mode
              </div>
              <div className="text-xs opacity-75 mt-1">Click objects to mark them</div>
            </div>
          )}
          
          {/* Error Status */}
          {locationError && (
            <div className="px-3 py-2 rounded-lg backdrop-blur-sm border bg-red-900/50 border-red-500/50 text-red-300 text-xs font-medium">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Location Error
              </div>
              <div className="text-xs opacity-75 mt-1">{locationError}</div>
            </div>
          )}
        </div>

        {/* Marker Overlay */}
        <MarkerOverlay
          markers={markers}
          onMarkerClick={handleMarkerClick}
          onEditMarker={handleEditMarker}
          onDeleteMarker={handleDeleteMarker}
          onToggleTracking={handleToggleTracking}
          selectedMarkerId={selectedMarkerId || undefined}
          stellariumEngine={stel}
        />

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-3 z-50">
          {/* Save View Button */}
          <SaveViewButton
            currentView={{
              ra_center: 0, // TODO: Get from Stellarium
              dec_center: 0,
              zoom_level: 1,
              stellarium_settings: stel?.core ? {} : undefined,
              observation_time: currentTime.toISOString(),
              location: userLocation ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                city: userLocation.city
              } : undefined,
            }}
            onSave={handleSaveView}
            isLoading={createViewMutation.isPending}
            featuredMarkerIds={markers.filter((m: SkyMarker) => m.is_featured).map((m: SkyMarker) => m.id)}
          />

          {/* Marker Mode Toggle */}
          <button
            onClick={() => setMarkerMode(!markerMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              markerMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Plus size={16} />
            {markerMode ? 'Exit Marker Mode' : 'Add Markers'}
          </button>
        </div>



        {/* Marker Modal */}
        <MarkerModal
          isOpen={isMarkerModalOpen}
          onClose={() => {
            setIsMarkerModalOpen(false);
            setEditingMarker(null);
            setPendingMarkerCoords(null);
          }}
          marker={editingMarker}
          coordinates={pendingMarkerCoords || undefined}
          onSubmit={editingMarker ? handleUpdateMarker : handleCreateMarker}
          isLoading={createMarkerMutation.isPending || updateMarkerMutation.isPending}
        />
    </Layout>
  );
};

export default Skymap;