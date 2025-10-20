# 🌟 AstroWorld Profile Page - Complete Guide

## 📍 Overview

The **Profile Page** is the central hub for users to manage their entire cosmic workspace. It displays all saved content, journal entries, collections, event subscriptions, and activity history in a unified, intuitive interface.

**Route:** `/profile`  
**Component:** `src/pages/profile/Profile.tsx`  
**Protection:** Protected route (requires authentication)

---

## 🎨 Features & Functionality

### 1. **Profile Header**
- **User Avatar:** Displays first letter of username with gradient background
- **User Information:**
  - Full name/username
  - Bio (if available)
  - Join date
  - Edit profile button (UI ready, functionality pending)

### 2. **Statistics Dashboard**
Four key metrics displayed with animated cards:
- 📑 **Saved Content Count** - Total items saved across all types
- 📖 **Journals Count** - Total journal entries
- 📁 **Collections Count** - Total collections created
- 📊 **Activities Count** - Total activities tracked

### 3. **Tabbed Interface**
Five main tabs with smooth transitions:

#### **📑 Saved Content Tab**
- **Features:**
  - Grid layout (3 columns on desktop, responsive)
  - Search functionality
  - Filter by content type (APOD, Mars Photos, EPIC, NEO, etc.)
  - Visual badges for content types
  - Favorite star indicator
  - Tags display (up to 3 tags shown)
  - Hover actions: View original, Delete
  - Empty state with call-to-action

- **Content Display:**
  - Title (line-clamped to 2 lines)
  - Notes preview (if available)
  - Tags with # prefix
  - Creation date
  - Favorite status
  - Delete confirmation dialog

#### **📖 Journals Tab**
- **Features:**
  - List layout with full-width cards
  - Search functionality
  - Journal type badges (Note, Observation, AI Conversation, Discovery)
  - Public/Private status indicator
  - Observation coordinates display (RA, Dec, Alt, Az)
  - Related content reference
  - Hover actions: Edit, Delete

- **Journal Types:**
  1. **Note** - General observations and thoughts
  2. **Observation** - Astronomical observations with coordinates
  3. **AI Conversation** - Murph AI chat logs
  4. **Discovery** - Notable discoveries and findings

#### **📁 Collections Tab**
- **Features:**
  - Grid layout (2 columns on desktop)
  - Collection name and description
  - Item count display
  - Public/Private status badge
  - Recent items preview (shows first 3)
  - Hover actions: Edit, Delete, View
  - Create collection button (UI ready)
  - Empty state with create button

- **Collection Display:**
  - Folder icon with name
  - Description text
  - Item count
  - Recent items list
  - Creation date
  - View collection button

#### **🔔 Subscriptions Tab**
- **Features:**
  - List layout with event cards
  - Active/Inactive status indicator
  - Event date and time display
  - Notification preferences (Email, In-App)
  - Notify before hours setting
  - Active bell icon for active subscriptions
  - Delete/Unsubscribe action

- **Notification Types:**
  - 📧 Email notifications
  - 🔔 In-app notifications
  - ⏰ Custom notification timing (hours before event)

#### **📊 Activity Tab**
- **Features:**
  - Timeline layout with compact cards
  - Activity description
  - Timestamp display
  - Content type badge (if related to content)
  - Auto-scrolling for long activity lists
  - Empty state for new users

- **Activity Types Tracked:**
  - View, Favorite, Save, Share
  - Comment, Journal creation
  - Collection creation, Subscription

---

## 🔧 Technical Implementation

### **Hooks Used**

```typescript
// Profile data
const { data: profile, isLoading: profileLoading } = useUserProfile();

// Content management
const { data: savedContent, isLoading: contentLoading } = useUserContent();

// Journal operations
const { data: journals, isLoading: journalsLoading } = useUserJournals();

// Collection management
const { data: collections, isLoading: collectionsLoading } = useUserCollections();

// Subscriptions
const { data: subscriptions, isLoading: subscriptionsLoading } = useUserSubscriptions();

// Activity tracking
const { data: activities, isLoading: activitiesLoading } = useRecentActivities();

// Delete operations
const deleteContent = useDeleteContent();
const deleteJournal = useDeleteJournal();
const deleteCollection = useDeleteCollection();
const deleteSubscription = useDeleteSubscription();
```

### **State Management**

```typescript
const [activeTab, setActiveTab] = useState<TabType>('saved');
const [searchQuery, setSearchQuery] = useState('');
const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
```

### **Data Filtering**

```typescript
// Saved content filtering
const filteredContent = savedContent?.filter((item) => {
  const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesType = filterType === 'all' || item.content_type === filterType;
  return matchesSearch && matchesType;
});

// Journal filtering
const filteredJournals = journals?.filter((item) =>
  item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.content.toLowerCase().includes(searchQuery.toLowerCase())
);
```

---

## 🎭 UI/UX Design

### **Color Scheme**
- **Background:** Black with purple/blue gradient overlay
- **Cards:** Glass-morphism effect (backdrop-blur with semi-transparent backgrounds)
- **Borders:** White with 10% opacity, hover changes to accent colors
- **Accent Colors:**
  - Purple: Content actions, profile elements
  - Blue: Journals
  - Green: Collections
  - Orange: Subscriptions
  - Various: Activity types

### **Animations**
All cards use **Framer Motion** animations:
- Fade-in with staggered delays
- Slide-in effects (left, right, up based on section)
- Scale animations on hover
- Smooth tab transitions

### **Responsive Design**
- **Desktop:** 3-column grid for content, 2-column for collections
- **Tablet:** 2-column grid
- **Mobile:** Single column layout
- Flexible search/filter bar
- Collapsible sections for small screens

### **Icons**
All icons from **Lucide React:**
- Bookmark, BookOpen, FolderOpen, Bell, Activity
- Star, Calendar, TrendingUp, Filter, Search
- Plus, Edit, Trash2, ExternalLink

---

## 🚀 User Actions

### **Available Actions**

| Action | Tab | Description |
|--------|-----|-------------|
| **View Original** | Saved Content | Navigate to original content source |
| **Delete Content** | Saved Content | Remove saved item with confirmation |
| **Edit Journal** | Journals | Edit journal entry (UI ready) |
| **Delete Journal** | Journals | Delete journal entry with confirmation |
| **Edit Collection** | Collections | Edit collection details (UI ready) |
| **Delete Collection** | Collections | Delete entire collection with confirmation |
| **View Collection** | Collections | View collection details and items |
| **Create Collection** | Collections | Create new collection (UI ready) |
| **Unsubscribe** | Subscriptions | Remove event subscription |
| **Edit Profile** | Header | Update user profile (UI ready) |

### **Confirmation Dialogs**
All delete actions trigger browser confirmation dialogs:
```typescript
if (confirm('Delete this item?')) {
  deleteContent.mutate(item.id);
}
```

---

## 📊 Backend Integration

### **API Endpoints Used**

```
GET /api/users/profile/                    # User profile with stats
GET /api/users/content/                    # Saved content list
GET /api/users/journals/                   # Journal entries
GET /api/users/collections/                # Collections with items
GET /api/users/subscriptions/              # Event subscriptions
GET /api/users/activities/recent/          # Recent activities

DELETE /api/users/content/{id}/            # Delete content
DELETE /api/users/journals/{id}/           # Delete journal
DELETE /api/users/collections/{id}/        # Delete collection
DELETE /api/users/subscriptions/{id}/      # Delete subscription
```

### **Data Models**

**UserProfile:**
```typescript
{
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  date_joined: string;
  saved_content_count: number;
  journals_count: number;
  collections_count: number;
  subscriptions_count: number;
}
```

**UserContent:**
```typescript
{
  id: number;
  content_type: ContentType;
  content_id: string;
  title: string;
  notes?: string;
  tags?: string[];
  is_favorite: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

**UserJournal:**
```typescript
{
  id: number;
  journal_type: JournalType;
  title: string;
  content: string;
  is_public: boolean;
  coordinates?: {
    ra?: number;
    dec?: number;
    alt?: number;
    az?: number;
  };
  related_content?: {
    id: number;
    title: string;
    content_type: string;
  };
  created_at: string;
  updated_at: string;
}
```

**UserCollection:**
```typescript
{
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  item_count: number;
  items: UserContent[];
  created_at: string;
  updated_at: string;
}
```

**UserSubscription:**
```typescript
{
  id: number;
  event_name: string;
  event_date: string;
  notify_before_hours: number;
  notify_email: boolean;
  notify_in_app: boolean;
  is_active: boolean;
  created_at: string;
}
```

**UserActivity:**
```typescript
{
  id: number;
  activity_type: ActivityType;
  description: string;
  timestamp: string;
  content?: {
    id: number;
    title: string;
    content_type: string;
  };
}
```

---

## 🔄 Cache Management

All data is cached using **TanStack Query** with automatic:
- **Refetching** on tab focus
- **Stale-while-revalidate** pattern
- **Optimistic updates** on mutations
- **Cache invalidation** after delete operations

Query keys:
```typescript
['userProfile']
['userContent']
['userJournals']
['userCollections']
['userSubscriptions']
['userActivities', 'recent']
```

---

## 🛠️ Future Enhancements

### **Phase 1: Edit Functionality**
- [ ] Profile editing modal
- [ ] Journal editing inline
- [ ] Collection editing with drag-drop reordering
- [ ] Bulk operations for content

### **Phase 2: Advanced Features**
- [ ] Export collections to JSON/PDF
- [ ] Share collections publicly
- [ ] Collection collaboration (multi-user)
- [ ] Advanced filtering (date ranges, multiple types)
- [ ] Sorting options (date, name, popularity)

### **Phase 3: Visual Enhancements**
- [ ] Image thumbnails for content
- [ ] Rich text editor for journals
- [ ] Activity visualization charts
- [ ] Heat map for activity patterns
- [ ] Achievement badges

### **Phase 4: Integration**
- [ ] Quick-add from other pages
- [ ] Context menu actions
- [ ] Keyboard shortcuts
- [ ] Mobile app deep linking

---

## 🎯 Usage Examples

### **Accessing the Profile Page**

1. **Via Navigation:**
   - Add profile link to navbar/sidebar
   - Navigate to `/profile`

2. **Via Code:**
   ```typescript
   import { useNavigate } from 'react-router-dom';
   
   const navigate = useNavigate();
   navigate('/profile');
   ```

### **Integration with Other Components**

The profile page works seamlessly with existing action buttons:

```typescript
// In ApodHero.tsx (already integrated)
<FavoriteButton 
  contentType="apod"
  contentId={apod.date}
  title={apod.title}
  metadata={{ url: apod.url, hdurl: apod.hdurl }}
/>

<SaveContentButton
  contentType="apod"
  contentId={apod.date}
  title={apod.title}
  metadata={{ explanation: apod.explanation }}
/>
```

These actions automatically update the profile page data through cache invalidation.

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  - Single column layout
  - Stacked filters
  - Collapsed stats (2x2 grid)
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - 2 column grid
  - Side-by-side filters
  - Expanded stats (1x4 grid)
}

/* Desktop */
@media (min-width: 1025px) {
  - 3 column grid (content)
  - 2 column grid (collections)
  - Full-width filters
  - Expanded stats (1x4 grid)
}
```

---

## ✅ Testing Checklist

- [x] Profile data loads correctly
- [x] All tabs switch smoothly
- [x] Search filters content
- [x] Content type filter works
- [x] Delete operations trigger confirmation
- [x] Empty states display properly
- [x] Loading states show during data fetch
- [x] Responsive design on all screen sizes
- [x] Animations don't cause performance issues
- [x] Icons display correctly
- [ ] Edit functionality (pending implementation)

---

## 📚 Related Documentation

- [USER_INTERACTION_API.md](./USER_INTERACTION_API.md) - Complete API reference
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Implementation summary
- [NASA_EXTENDED_INTEGRATION.md](./NASA_EXTENDED_INTEGRATION.md) - NASA API integration

---

## 🎉 Summary

The **Profile Page** is the culmination of the entire user interaction system, providing a comprehensive view of:
- All saved NASA content across 9 different types
- Personal astronomical observations and notes
- Organized collections of cosmic discoveries
- Event subscriptions with smart notifications
- Complete activity history timeline

It's the **Personal Cosmic Workspace** users can use to manage their entire AstroWorld experience in one place! 🚀✨
