# 48 LIVE UPDATE   Fan Community and Idol News Application

## Overview
A comprehensive fan community and news platform for 48 Group idol fans, featuring news updates, rumors, discussions, and detailed group information. All content is displayed in Indonesian language with a modern, futuristic aesthetic featuring smooth transitions, neon gradients, and glassmorphism UI elements.

## Design System
- **Modern futuristic aesthetic** with smooth transitions and animations
- **Neon gradients** and **glassmorphism UI elements** throughout the interface
- **Dual-theme system** with dark and light modes
- Theme toggle switch accessible in the header
- Consistent futuristic design language across all pages and components
- Responsive design optimized for desktop and mobile

## Authentication & User Roles
- Internet Identity integration for user authentication
- Two user roles:
  - **48 LIVE ADMIN**: Full administrative privileges with access to comprehensive admin dashboard
  - **Regular Users**: Logged-in users with limited permissions
- Guest users can browse content but cannot interact

## Core Segments

### 48 LIVE UPDATE (News Section)
- Admin-only content creation with articles containing title, optional featured image, content body, and publication date
- Admin can edit and delete any article
- All users can view articles and add comments
- Articles displayed in modern futuristic news card layout with glassmorphism effects, neon accents, images (when available) and timestamps

### 48 LIVE RUMOR (Rumors Section)
- Admin-only rumor posts with title, content, and status labels
- Three status types: "Waiting", "Confirm", "Unconfirm"
- Admin can update rumor status and edit/delete rumors
- All users can view rumors and add comments
- Status displayed with futuristic color-coded tags with neon glow effects

### 48 LIVE DISCUSS (Discussion Forum)
- Logged-in users can create discussion topics with title, category, content, and timestamp
- All logged-in users can comment on discussions
- Admin can delete any discussion or comment
- Futuristic forum-style layout with glassmorphism thread cards and smooth transitions

## Groups Section
Dedicated pages for groups including: AKB48, SKE48, NMB48, HKT48, NGT48, STU48, JKT48, BNK48, MNL48, CGM48, KLP48, TSH48, AKB48 Team TP.

Each group page contains:
- Basic information: formation date, base location, theater location, member count
- **Member profiles** with full name, nickname, birthdate, generation, team assignment, and biography
- Theater schedules and events
- Group news and history
- **Discography** including singles and albums with titles and tracklists
- Concert setlists
- **Setlist Theater** section displaying theater setlists with title and tracklist
- All content styled with futuristic glassmorphism cards and neon accents

### Member Management
- Each group displays complete member roster with detailed profiles
- Member information includes: full name, nickname, birthdate, generation, team assignment, and biography
- Members displayed in futuristic card layout with glassmorphism effects
- All member data automatically synchronized from backend group management

### Discography Management
- **Singles section** displaying all group singles with titles and complete tracklists
- **Albums section** displaying all group albums with titles and complete tracklists
- Each release shown in futuristic cards with neon accents and glassmorphism styling
- All discography data automatically synchronized from backend group management

### Setlist Theater Management
- Theater setlists displayed with title and complete tracklist
- Each setlist presented in futuristic design supporting both light and dark themes
- All setlist data automatically synchronized from backend group management

## Admin Dashboard
Comprehensive admin interface for "48 LIVE ADMIN" users featuring:
- **Overview cards** displaying counts of articles, rumors, discussions, groups, and trending items with futuristic styling
- **Quick action buttons** for creating, editing, and managing content across all segments
- **Embedded management views** for AdminDiscussions and AdminTrending components
- **Content moderation tools** for discussions and comments
- **Trending section management** to select featured posts
- **User management capabilities**
- **Rumor status update controls**
- **Comprehensive Groups Management** with full CRUD capabilities
- All dashboard components styled with glassmorphism effects, neon gradients, and smooth transitions

### Content Creation Features
- **Article Creation**: Fully functional form with title, optional image upload, content body fields connected to `createArticle` backend function
- **Rumor Creation**: Complete form with title, content, and status selection (Waiting/Confirm/Unconfirm) connected to `createRumor` backend function
- **Discussion Creation**: Working form with title, category selection, and content fields connected to `createDiscussion` backend function
- **Functional Create/Add buttons**: All "Tambah" buttons in AdminArticles, AdminRumors, and AdminDiscussions components must have working event handlers that open creation forms
- **Modal/Panel Creation Forms**: Creation forms displayed in futuristic modal dialogs or slide-out panels with glassmorphism styling
- **React Query Integration**: Forms must use proper mutation hooks (useCreateArticle, useCreateRumor, useCreateDiscussion) from useQueries.ts
- **Backend Type Compliance**: Form submissions must send data matching backend request types (CreateArticleRequest, CreateRumorRequest, CreateDiscussionRequest)
- **Frontend validation** for all required fields before submission with Indonesian error messages
- **Optional image validation**: Image upload is optional for articles, validation allows null or empty image fields
- **Toast Notifications**: Success/error feedback using futuristic toast notifications in Indonesian language
- **Loading States**: Visual loading indicators with neon/glass effects during form submission
- **Automatic data refresh** through React Query cache invalidation after successful creation
- **Theme-Aware Styling**: All creation interfaces must support both dark and light themes with consistent futuristic design
- **Error Handling**: Proper error state display with futuristic styling for failed submissions

### Groups Management
- **Admin-only comprehensive group management interface** within the dashboard
- **Full CRUD operations** for groups with proper backend integration

#### Create Group
- **Add new group functionality** with form fields for:
  - Group name (required)
  - Formation date
  - Base location
  - Theater location
- **Initialize empty data structures** for members, schedules, news, discography, and setlists
- **Create group button** with neon glow effects and confirmation feedback
- **Form validation** with Indonesian error messages

#### Edit Group
- **Group selection dropdown** to choose from existing groups
- **Editable form fields** that properly populate with selected group data:
  - Formation date
  - Base location
  - Theater location
- **Save changes functionality** that correctly calls `updateGroup` backend function
- **Real-time field updates** with smooth transitions and visual feedback
- **Cancel changes option** to revert unsaved modifications

#### Delete Group
- **Delete group button** with confirmation dialog
- **Permanent deletion** from both frontend and backend
- **Confirmation dialog** with warning message in Indonesian
- **Cascading deletion** of all associated group data (members, setlists, discography)

#### Member Management Section
- **Complete member roster management** for selected group
- **Add new members** with full profile information (full name, nickname, birthdate, generation, team, biography)
- **Edit existing members** with ability to modify all profile fields
- **Delete members** with confirmation dialog
- Member list displayed in futuristic table/card layout with edit and delete actions

#### Setlist Theater Management Section
- **Complete setlist management** for selected group
- **Add new setlists** with title and tracklist (list of songs)
- **Edit existing setlists** including title and individual songs in tracklist
- **Delete setlists** with confirmation dialog
- **Add/remove individual songs** from setlist tracklists
- Setlist management interface with futuristic styling and smooth interactions

#### Discography Management Section
- **Singles management**: Add, edit, delete singles with title and complete tracklist
- **Albums management**: Add, edit, delete albums with title and complete tracklist
- **Tracklist editing**: Add, edit, delete individual songs from singles and albums
- Each release type managed separately with dedicated interfaces
- Futuristic form layouts with glassmorphism styling for all discography management

#### Management Interface Features
- **Enhanced UI with smooth transitions** and neon glow effects for all interactive elements
- **Proper form field population** when selecting groups for editing
- **Real-time synchronization** with public group pages
- **Futuristic glassmorphism interface** with neon gradients supporting both dark and light themes
- **Indonesian language interface** throughout all management sections
- **Form validation and error handling** for all input fields
- **Confirmation dialogs** for all delete operations
- **Visual feedback** for save operations and form submissions

## Homepage & Navigation
- Modern futuristic news portal layout on homepage with glassmorphism hero section
- Trending section featuring admin-selected posts from any segment with neon-accented cards
- Navigation menu with futuristic styling and smooth hover transitions
- Theme toggle switch prominently displayed in header
- Responsive design with consistent futuristic aesthetic

## Backend Data Storage
- User accounts and authentication data
- News articles with metadata and content (with optional image field)
- Rumor posts with status tracking
- Discussion topics and comment threads
- **Complete group information** including basic details, members, setlists, and discography
- **Member profiles** with full biographical information per group
- **Theater setlists** with titles and complete tracklists per group
- **Discography data** including singles and albums with tracklists per group
- Theater schedules and event data
- Trending post selections
- User-generated comments across all segments
- **Comprehensive group management data** with full CRUD operations via backend functions

## Backend Functions Required
- **createArticle**: Create new article with title, optional image, content, and publication date
- **createRumor**: Create new rumor with title, content, and status
- **createDiscussion**: Create new discussion with title, category, and content
- **createGroup**: Create new group with all initial data structures
- **updateGroup**: Update existing group information and save changes
- **deleteGroup**: Permanently delete group and all associated data
- **getGroup**: Retrieve specific group data for editing
- **getAllGroups**: Retrieve list of all groups for selection dropdown

## Key Features
- Comment system available on all content types with futuristic styling
- Admin moderation capabilities across all user-generated content
- Dual-theme system (dark/light) with smooth theme transitions
- Glassmorphism UI elements and neon gradient accents throughout
- Smooth animations and transitions on all interactive elements
- Indonesian language interface and content
- Role-based content creation and management
- **Fully functional content creation buttons** with proper event handlers and form modals
- **Complete React Query integration** for all creation operations with proper mutation hooks
- **Comprehensive form validation** and error handling with Indonesian feedback
- **Optional image upload** for articles with graceful handling of null/empty image fields
- **Toast notification system** for success/error feedback with futuristic styling
- **Loading state management** with visual indicators for all async operations
- **Complete group CRUD operations** with enhanced UI interactions
- **Real-time synchronization** between admin management and public group pages
- **Enhanced visual feedback** for all admin operations
- **Theme-aware creation interfaces** supporting both dark and light modes
