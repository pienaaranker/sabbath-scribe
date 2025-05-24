# SabbathScribe

SabbathScribe is a modern Church Roster Management application that helps churches efficiently manage their weekly Sabbath service assignments. Built with Next.js and Firebase, it provides an intuitive interface for managing church roles, assignments, and schedules.

## Features

- **Role Assignment Management**
  - Assign members to various church roles for each Sabbath
  - Support for multiple roles (Preacher, Elder, Sabbath School Host, etc.)
  - Intelligent role filtering based on member capabilities

- **People Management**
  - Maintain a database of church members
  - Track role preferences and capabilities
  - Manage member availability

- **Schedule View**
  - Interactive calendar interface
  - Filter assignments by role or person
  - Search functionality
  - Weekly Sabbath navigation

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: Tailwind CSS with shadcn/ui
- **Backend**: Firebase (Authentication & Firestore)
- **State Management**: React Context API
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd sabbath-scribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Follow the instructions in `FIREBASE_SETUP.md` to:
     - Create a Firebase project
     - Enable Authentication
     - Set up Firestore
     - Configure environment variables

4. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration values

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

- `/src/app` - Next.js app directory (pages and API routes)
- `/src/components` - React components
  - `/admin` - Admin panel components
  - `/layout` - Layout components
  - `/schedule` - Schedule view components
  - `/ui` - Reusable UI components
- `/src/context` - React Context providers
- `/src/lib` - Utility functions and constants
- `/src/types` - TypeScript type definitions

## Data Models

- **Role**: Church service roles (e.g., Preacher, Elder)
- **Person**: Church member information and role capabilities
- **Assignment**: Role assignments for specific dates
- **SabbathAssignment**: Combined assignment information for display

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please refer to the documentation in the `docs` directory or open an issue in the repository.
