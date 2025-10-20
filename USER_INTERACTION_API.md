# User Interaction CRUD API Documentation

## Overview
This document details the complete CRUD API for the AstroWorld user interaction system. Users can now create, read, update, and delete their personal cosmic workspace content including favorites, journals, collections, subscriptions, and activity tracking.

## Architecture

### Database Models
1. **UserContent** - Unified model for all saved NASA content
2. **UserJournal** - Personal notes, observations, and AI conversations
3. **UserCollection** - User-created playlists/collections
4. **UserSubscription** - Event notifications and alerts
5. **UserActivity** - Activity log for gamification (read-only)

### API Structure
All endpoints are under `/api/users/` with JWT authentication required.

---

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. User Content API (`/api/users/content/`)

Save and manage NASA content (APOD, Mars photos, EPIC, NEO, etc.)

### List All Saved Content
```http
GET /api/users/content/
```

**Query Parameters:**
- `content_type` - Filter by type: `apod`, `mars_photo`, `epic`, `neo`, `exoplanet`, `space_weather`, `news`, `celestial`, `event`
- `is_favorite` - Filter by favorite status: `true` or `false`
- `tags` - Filter by tags (comma-separated): `nebula,colorful`
- `search` - Search in notes and tags
- `ordering` - Order by: `created_at`, `-created_at`, `updated_at`, `-updated_at`

**Response:**
```json
[
  {
    "id": 1,
    "content_type": "apod",
    "content_id": "2024-01-15",
    "title": "Pillars of Creation",
    "notes": "Amazing structure!",
    "tags": ["nebula", "jwst"],
    "is_favorite": true,
    "created_at": "2024-01-16T10:30:00Z",
    "updated_at": "2024-01-16T10:30:00Z"
  }
]
```

### Save New Content
```http
POST /api/users/content/
```

**Request Body:**
```json
{
  "content_type": "apod",
  "content_id": "2024-01-15",
  "title": "Pillars of Creation",
  "notes": "Amazing structure!",
  "tags": ["nebula", "jwst"],
  "is_favorite": true,
  "metadata": {
    "image_url": "https://...",
    "explanation": "..."
  }
}
```

**Response:** `201 Created` with created content object

### Get Specific Content
```http
GET /api/users/content/{id}/
```

### Update Content
```http
PATCH /api/users/content/{id}/
```

**Request Body:** (partial update)
```json
{
  "notes": "Updated notes",
  "tags": ["nebula", "jwst", "favorite"],
  "is_favorite": false
}
```

### Delete Content
```http
DELETE /api/users/content/{id}/
```

**Response:** `204 No Content`

### Get All Favorites
```http
GET /api/users/content/favorites/
```

Returns all content where `is_favorite=true`

### Toggle Favorite Status
```http
POST /api/users/content/{id}/toggle_favorite/
```

Toggles the `is_favorite` field between true/false.

---

## 2. User Journal API (`/api/users/journals/`)

Create personal notes, sky observations, and AI conversation logs.

### List All Journals
```http
GET /api/users/journals/
```

**Query Parameters:**
- `journal_type` - Filter by type: `note`, `observation`, `ai_conversation`, `discovery`
- `related_content` - Filter by related content ID
- `search` - Search in title and content
- `ordering` - Order by: `created_at`, `-created_at`, `updated_at`, `-updated_at`

**Response:**
```json
[
  {
    "id": 1,
    "journal_type": "observation",
    "title": "Jupiter Observation",
    "content": "Saw the Great Red Spot clearly tonight",
    "coordinates": {
      "ra": "14h 15m 39s",
      "dec": "-15° 56' 15\"",
      "alt": "45.5",
      "az": "180.2"
    },
    "is_public": false,
    "related_content": {
      "id": 5,
      "content_type": "celestial",
      "title": "Jupiter"
    },
    "created_at": "2024-01-16T22:15:00Z"
  }
]
```

### Create New Journal
```http
POST /api/users/journals/
```

**Request Body:**
```json
{
  "journal_type": "observation",
  "title": "Jupiter Observation",
  "content": "Saw the Great Red Spot clearly tonight",
  "coordinates": {
    "ra": "14h 15m 39s",
    "dec": "-15° 56' 15\"",
    "alt": "45.5",
    "az": "180.2"
  },
  "is_public": false,
  "related_content_id": 5
}
```

### Get Specific Journal
```http
GET /api/users/journals/{id}/
```

### Update Journal
```http
PATCH /api/users/journals/{id}/
```

### Delete Journal
```http
DELETE /api/users/journals/{id}/
```

### Get All Observations
```http
GET /api/users/journals/observations/
```

Returns all journals with `journal_type=observation` that have coordinates.

### Get AI Conversations
```http
GET /api/users/journals/ai_conversations/
```

Returns all journals with `journal_type=ai_conversation`.

---

## 3. User Collection API (`/api/users/collections/`)

Create and manage collections (playlists) of saved content.

### List All Collections
```http
GET /api/users/collections/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "My Favorite Nebulae",
    "description": "Collection of beautiful nebulae",
    "is_public": true,
    "item_count": 5,
    "items": [
      {
        "id": 1,
        "content_type": "apod",
        "title": "Pillars of Creation"
      },
      {
        "id": 2,
        "content_type": "apod",
        "title": "Orion Nebula"
      }
    ],
    "created_at": "2024-01-10T12:00:00Z"
  }
]
```

### Create New Collection
```http
POST /api/users/collections/
```

**Request Body:**
```json
{
  "name": "My Favorite Nebulae",
  "description": "Collection of beautiful nebulae",
  "is_public": true,
  "item_ids": [1, 2, 5]
}
```

### Get Specific Collection
```http
GET /api/users/collections/{id}/
```

### Update Collection
```http
PATCH /api/users/collections/{id}/
```

**Request Body:**
```json
{
  "name": "Updated Collection Name",
  "item_ids": [1, 2, 5, 8, 10]
}
```

### Delete Collection
```http
DELETE /api/users/collections/{id}/
```

### Add Item to Collection
```http
POST /api/users/collections/{id}/add_item/
```

**Request Body:**
```json
{
  "content_id": 15
}
```

### Remove Item from Collection
```http
POST /api/users/collections/{id}/remove_item/
```

**Request Body:**
```json
{
  "content_id": 15
}
```

---

## 4. User Subscription API (`/api/users/subscriptions/`)

Subscribe to event notifications and alerts.

### List All Subscriptions
```http
GET /api/users/subscriptions/
```

**Query Parameters:**
- `active_only` - Filter active subscriptions: `true` or `false`
- `notify_email` - Filter by email notifications: `true` or `false`
- `notify_in_app` - Filter by in-app notifications: `true` or `false`
- `ordering` - Order by: `created_at`, `-created_at`, `event_date`, `-event_date`

**Response:**
```json
[
  {
    "id": 1,
    "event_type": "meteor_shower",
    "event_id": "perseids_2024",
    "event_name": "Perseids Meteor Shower",
    "event_date": "2024-08-12T03:00:00Z",
    "is_active": true,
    "notify_email": true,
    "notify_in_app": true,
    "notify_before_hours": 24,
    "created_at": "2024-07-15T10:00:00Z"
  }
]
```

### Create New Subscription
```http
POST /api/users/subscriptions/
```

**Request Body:**
```json
{
  "event_type": "meteor_shower",
  "event_id": "perseids_2024",
  "event_name": "Perseids Meteor Shower",
  "event_date": "2024-08-12T03:00:00Z",
  "notify_email": true,
  "notify_in_app": true,
  "notify_before_hours": 24
}
```

### Update Subscription
```http
PATCH /api/users/subscriptions/{id}/
```

### Delete Subscription
```http
DELETE /api/users/subscriptions/{id}/
```

### Toggle Active Status
```http
POST /api/users/subscriptions/{id}/toggle_active/
```

Toggles the `is_active` field.

### Get Upcoming Events
```http
GET /api/users/subscriptions/upcoming/
```

Returns all active subscriptions with `event_date >= now` ordered by date.

---

## 5. User Activity API (`/api/users/activities/`)

Read-only activity log for gamification and tracking.

### List All Activities
```http
GET /api/users/activities/
```

**Query Parameters:**
- `activity_type` - Filter by type: `view`, `favorite`, `save`, `share`, `comment`, `journal`, `collection_create`, `subscription`
- `limit` - Limit number of results
- `ordering` - Order by: `timestamp`, `-timestamp`

**Response:**
```json
[
  {
    "id": 1,
    "activity_type": "favorite",
    "description": "Favorited 'Pillars of Creation'",
    "content": {
      "id": 1,
      "content_type": "apod",
      "title": "Pillars of Creation"
    },
    "timestamp": "2024-01-16T10:30:00Z"
  }
]
```

### Get Recent Activities
```http
GET /api/users/activities/recent/
```

Returns the last 50 activities.

---

## 6. User Profile API (`/api/users/profile/`)

Get comprehensive user profile with aggregated statistics.

### Get User Profile
```http
GET /api/users/profile/
```

**Response:**
```json
{
  "id": 1,
  "username": "astro_explorer",
  "email": "user@example.com",
  "full_name": "John Doe",
  "bio": "Amateur astronomer and space enthusiast",
  "profile_picture": "https://...",
  "date_joined": "2024-01-01T00:00:00Z",
  "saved_content_count": 45,
  "journals_count": 12,
  "collections_count": 5,
  "subscriptions_count": 8,
  "recent_activities": [
    {
      "id": 1,
      "activity_type": "favorite",
      "description": "Favorited 'Pillars of Creation'",
      "timestamp": "2024-01-16T10:30:00Z"
    }
  ]
}
```

---

## Content Types

### UserContent `content_type` options:
- `apod` - Astronomy Picture of the Day
- `mars_photo` - Mars Rover Photos
- `epic` - EPIC Earth Images
- `neo` - Near-Earth Objects
- `exoplanet` - Exoplanets
- `space_weather` - Space Weather Events
- `news` - Space News Articles
- `celestial` - Celestial Objects (from Skymap)
- `event` - Astronomical Events

### UserJournal `journal_type` options:
- `note` - General notes
- `observation` - Sky observations (with coordinates)
- `ai_conversation` - Murph AI conversations
- `discovery` - Personal discoveries

### UserActivity `activity_type` options:
- `view` - Viewed content
- `favorite` - Favorited content
- `save` - Saved content
- `share` - Shared content
- `comment` - Commented on content
- `journal` - Created journal entry
- `collection_create` - Created collection
- `subscription` - Created subscription

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## Integration Examples

### Frontend React Hook Example

```typescript
// hooks/useUserContent.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useUserContent = () => {
  const queryClient = useQueryClient();

  const { data: savedContent, isLoading } = useQuery({
    queryKey: ['user-content'],
    queryFn: () => api.get('/users/content/').then(res => res.data),
  });

  const saveContent = useMutation({
    mutationFn: (content: SaveContentData) => 
      api.post('/users/content/', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-content'] });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: (id: number) => 
      api.post(`/users/content/${id}/toggle_favorite/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-content'] });
    },
  });

  return {
    savedContent,
    isLoading,
    saveContent,
    toggleFavorite,
  };
};
```

### Action Button Component Example

```tsx
// components/SaveContentButton.tsx
import { useUserContent } from '@/hooks/useUserContent';

export const SaveContentButton = ({ contentType, contentId, title }) => {
  const { saveContent } = useUserContent();

  const handleSave = () => {
    saveContent.mutate({
      content_type: contentType,
      content_id: contentId,
      title: title,
      is_favorite: false,
    });
  };

  return (
    <button onClick={handleSave}>
      {saveContent.isPending ? 'Saving...' : 'Save to Collection'}
    </button>
  );
};
```

---

## Next Steps

1. **Frontend Implementation:**
   - Create React hooks for all CRUD operations
   - Add action buttons to NASA components (APOD, Mars, News, etc.)
   - Build user profile page UI
   - Implement collection management UI

2. **Advanced Features:**
   - Implement activity tracking middleware
   - Add notification system for subscriptions
   - Create public collection sharing
   - Add social features (follow users, share collections)

3. **Testing:**
   - Write unit tests for models and serializers
   - Create integration tests for API endpoints
   - Add frontend testing for hooks and components

---

## Database Schema

### UserContent
- `user` (FK) - User who saved the content
- `content_type` (CharField) - Type of NASA content
- `content_id` (CharField) - External ID from NASA API
- `title` (CharField) - Content title
- `notes` (TextField) - User notes
- `tags` (JSONField) - Array of tags
- `is_favorite` (Boolean) - Favorite status
- `metadata` (JSONField) - Additional data
- `created_at`, `updated_at` (DateTime)
- **Indexes:** (user, content_type), (user, is_favorite), (created_at)
- **Unique:** (user, content_type, content_id)

### UserJournal
- `user` (FK) - Journal owner
- `journal_type` (CharField) - Type of journal
- `title` (CharField) - Journal title
- `content` (TextField) - Journal content
- `coordinates` (JSONField) - Sky coordinates for observations
- `is_public` (Boolean) - Public visibility
- `related_content` (FK) - Related UserContent
- `ai_conversation_data` (JSONField) - Murph AI data
- `created_at`, `updated_at` (DateTime)
- **Indexes:** (user, journal_type), (user, is_public), (created_at)

### UserCollection
- `user` (FK) - Collection owner
- `name` (CharField) - Collection name
- `description` (TextField) - Description
- `is_public` (Boolean) - Public visibility
- `items` (M2M) - UserContent items
- `created_at`, `updated_at` (DateTime)
- **Indexes:** (user, is_public)

### UserSubscription
- `user` (FK) - Subscriber
- `event_type` (CharField) - Type of event
- `event_id` (CharField) - External event ID
- `event_name` (CharField) - Event name
- `event_date` (DateTime) - Event date/time
- `is_active` (Boolean) - Active status
- `notify_email`, `notify_in_app` (Boolean)
- `notify_before_hours` (Integer) - Hours before event
- `created_at` (DateTime)
- **Indexes:** (user, is_active), (event_date)
- **Unique:** (user, event_type, event_id)

### UserActivity
- `user` (FK) - User who performed activity
- `activity_type` (CharField) - Type of activity
- `description` (CharField) - Activity description
- `content` (FK) - Related UserContent
- `metadata` (JSONField) - Additional data
- `timestamp` (DateTime)
- **Index:** (timestamp)

---

## Summary

✅ **Complete CRUD API for user interaction system**
✅ **5 comprehensive models with proper relationships**
✅ **10+ serializers for data validation**
✅ **5 ViewSets with filtering, search, ordering**
✅ **Custom actions (favorites, toggle, add/remove items)**
✅ **Proper authentication and permissions**
✅ **Database migrations applied**
✅ **Server running successfully**

The backend API is complete and ready for frontend integration!
