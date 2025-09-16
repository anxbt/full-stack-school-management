# Messaging and Notification System Design

## 1. Core Objective

To create a seamless, role-aware communication platform that connects teachers, parents, and school administration. The system will support targeted announcements, direct messaging, and automated notifications to ensure timely and relevant information is delivered to the right people.

## 2. User Stories

-   **Teacher to Parents (Class-wide):** As a teacher of Class 5B, I want to post a homework announcement so that all parents of students in Class 5B are notified.
-   **Teacher to Parent (Direct):** As a teacher, I want to send a private message to a specific student's parent to discuss their progress.
-   **Admin to All:** As a school admin, I want to send an announcement to all teachers and parents about an upcoming school-wide event (e.g., a holiday).
-   **Parent to Teacher:** As a parent, I want to reply to a teacher's message or initiate a new conversation with my child's class teacher.
-   **System to User (Automated):** As a parent, I want to receive an automated notification when my child's exam results are published.

## 3. Key Features

-   **Announcements:**
    -   Role-based (Admin, Teacher).
    -   Targeted to specific audiences (e.g., whole school, a specific class, all teachers).
-   **Direct Messaging (Conversations):**
    -   One-to-one conversations (Teacher-Parent, Admin-Teacher, etc.).
    -   Read receipts (`seen` status).
-   **Notifications:**
    -   A centralized place to see all important updates (new messages, announcements, system events).
    -   `isRead` status to track what the user has seen.
-   **Real-time Updates:** Users should see new messages and notifications instantly without needing to refresh the page.

## 4. Database Schema Design (`schema.prisma`)

We'll need three new core models: `Conversation`, `Message`, and `Notification`.

```prisma
// 1. Conversation Model: Represents a thread between two or more users.
model Conversation {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt // To sort conversations by last message time

  // Participants in the conversation
  // We store user IDs as strings and manage relations in the app logic
  // to support different user types (Teacher, Parent, Admin).
  participantIds String[]

  messages Message[]
}

// 2. Message Model: Represents a single message within a conversation.
model Message {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  body      String   // The text content of the message
  isRead    Boolean  @default(false) // Or use a separate 'seenBy' array of user IDs

  // Who sent the message
  senderId String

  // Relation to Conversation
  conversationId Int
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

// 3. Notification Model: For system-wide alerts and announcements.
model Notification {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  type        String   // e.g., "HOMEWORK", "EVENT", "RESULT_PUBLISHED"
  content     String   // "New homework for Math has been assigned."
  isRead      Boolean  @default(false)
  link        String?  // Optional link to navigate to, e.g., "/student/results"

  // Who this notification is for
  recipientId String
}

// We also need to modify the existing Announcement model to be more robust.
// This is better than using Notifications for everything.
model Announcement {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  date        DateTime @default(now())

  // Who created it
  authorId String

  // Who is it for?
  // An array of class IDs. If empty, it's for the whole school.
  targetClassIds Int[]

  // Relation to School
  schoolId String
  school   School @relation(fields: [schoolId], references: [id], onDelete: Cascade)
}
```

## 5. Server Actions & API Routes

-   `createAnnouncement(authorId, schoolId, title, description, targetClassIds)`: Creates an announcement and generates notifications for all relevant parents and students.
-   `getAnnouncementsForUser(userId, schoolId)`: Fetches all announcements relevant to the user (school-wide and class-specific).
-   `sendMessage(senderId, conversationId, body)`: Sends a new message in a conversation and creates notifications for other participants.
-   `getConversationsForUser(userId)`: Fetches all conversation threads for a user, sorted by the most recent message.
-   `getMessagesForConversation(conversationId)`: Fetches all messages for a selected conversation.
-   `getNotificationsForUser(userId)`: Fetches all unread notifications for a user.
-   `markNotificationAsRead(notificationId)`: Marks a specific notification as read.

## 6. Real-time Implementation (Recommended)

To make the experience feel modern, you need real-time updates. A simple and effective way to do this is with a service like **Pusher** or **Ably**.

**Workflow:**
1.  A user sends a message via the `sendMessage` server action.
2.  After the message is saved to the database, the server action triggers a real-time event (e.g., `pusher.trigger('conversation-123', 'new-message', messageData)`).
3.  The frontend clients subscribed to that "channel" (e.g., `conversation-123`) receive the new message instantly and update the UI.

This avoids the need for constant polling and makes the app feel alive.

## 7. Frontend Components

-   **`NotificationBell.tsx`**: An icon in the main navbar that shows a badge with the count of unread notifications. Clicking it opens a dropdown.
-   **`NotificationDropdown.tsx`**: Lists recent notifications with links.
-   **`MessagingPage.tsx`**: A two-column layout.
    -   **`ConversationList.tsx`** (Left Column): Shows all conversation threads, sorted by the last message.
    -   **`ChatWindow.tsx`** (Right Column): Displays messages for the selected conversation and includes a text input to send new messages.
-   **`AnnouncementCard.tsx`**: A component to display a single announcement.
-   **`CreateAnnouncementModal.tsx`**: A form for teachers/admins to create new announcements.

This design provides a solid foundation for building a comprehensive and user-friendly communication system. You can implement it piece by piece, starting with announcements and then moving to direct messaging.