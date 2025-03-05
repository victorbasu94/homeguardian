# HomeGuardian

HomeGuardian is an AI-driven home maintenance application that helps homeowners keep track of maintenance tasks and schedules.

## Features

- AI-generated maintenance plans based on home details
- Task tracking and management
- Reminders and notifications
- Vendor recommendations
- Maintenance history

## Tech Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/victorbasu94/homeguardian.git
cd homeguardian
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Update the variables as needed

4. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:8080.

## Building for Production

```sh
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/pages` - Application pages
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and configurations

## OpenAI Integration

HomeGuardian uses OpenAI's API to generate personalized home maintenance plans. The application supports both production and development environments:

### Setting Up OpenAI Integration

1. **Get an API Key**:
   - Sign up for an account at [OpenAI](https://platform.openai.com/)
   - Generate an API key from the [API Keys page](https://platform.openai.com/api-keys)

2. **Configure Environment Variables**:
   - Copy `.env.example` to `.env.local` for development
   - Add your OpenAI API key:
     ```
     REACT_APP_OPENAI_API_KEY=your_api_key_here
     ```

3. **Development Mode**:
   - In development mode (`NODE_ENV !== 'production'`), the application uses mock data instead of calling the OpenAI API
   - This saves API credits during development
   - The mock data is dynamically adjusted based on home details

4. **Production Mode**:
   - In production mode (`NODE_ENV === 'production'`), the application calls the OpenAI API
   - Ensure your API key is set in your production environment
   - For security, API calls should ideally be proxied through your backend

### Usage

The maintenance plan generation is handled by the `getMaintenancePlan` function in `src/lib/maintenanceApi.ts`. To use it:

```typescript
import { getMaintenancePlan, HomeDetails } from '@/lib/maintenanceApi';

// Example home details
const homeDetails: HomeDetails = {
  id: 'home-123',
  location: 'Seattle, WA',
  year_built: 1985,
  square_footage: 2200,
  roof_type: 'Asphalt Shingle',
  hvac_type: 'Central Air'
};

// Get maintenance plan
async function fetchMaintenancePlan() {
  try {
    const plan = await getMaintenancePlan(homeDetails);
    console.log(plan);
  } catch (error) {
    console.error('Error fetching maintenance plan:', error);
  }
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
