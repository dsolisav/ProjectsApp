## Designio - Project Management App 🗂️

Welcome to **Designio**, a robust project management application built with **Next.js** 🚀, **Tailwind CSS** 🌊, **shadcn** 🎨, and **Supabase** ⚡️. Designio is deployed and available at [https://designio-app.vercel.app/](https://designio-app.vercel.app/).

### Features

- **Authentication and Authorization**: Users can create accounts and log in seamlessly. The authentication service is powered by Supabase ⚡️, ensuring secure access.

- **Role Management**: Designio supports three distinct roles for users, each with tailored dashboards to streamline tasks:
  - **Client**: Can create new projects.
  - **Project Manager**: Has the ability to view all projects, assign projects to designers, and edit or delete projects.
  - **Designer**: Can view only their assigned projects, with no editing or deletion rights.

- **Project Structure**: Each project comprises the following elements:
  - **Title**
  - **Description**
  - **Status**
  - **Client**: The user who created the project.
  - **Main Support File**: A key file or document associated with the project.
  - **Assigned Designer**

- **Project CRUD Operations**: All Create, Read, Update, and Delete (CRUD) operations for projects are supported and managed by the respective user roles within the application.