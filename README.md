# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1474b378-2ab9-4696-ac83-91d13cd26c64

## Environment Setup

This project requires Supabase environment variables to function. Before running the project:

### Local Development

1. Copy the environment template:
```sh
cp .env.example .env
```

2. Get your Supabase credentials from [your Supabase dashboard](https://supabase.com/dashboard)

3. Update `.env` with your actual values:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Deployment (Vercel)

1. In your Vercel dashboard, navigate to your project
2. Go to Settings → Environment Variables
3. Add the following variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### Other Platforms

For other deployment platforms, ensure you set the same environment variables in their respective configuration systems.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1474b378-2ab9-4696-ac83-91d13cd26c64) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1474b378-2ab9-4696-ac83-91d13cd26c64) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Security Note

This project uses environment variables for sensitive configuration. Never commit real API keys or secrets to the repository. Always use the `.env.example` template and configure actual values through environment variables.
