# Horizon Banking App

Welcome to the Horizon Banking App! This web application enables users to securely link their bank accounts using Plaid and transfer money using Dwolla. Built with modern technologies, the app provides a sleek and responsive user experience.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design](#design)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Bank Account Linking**: Users can link their bank accounts securely with Plaid.
- **Money Transfers**: Users can transfer money effortlessly using Dwolla.
- **Real-time Error Monitoring**: Errors are logged in real-time using Sentry.
- **Responsive Design**: The application features a clean, responsive design built with Tailwind CSS.
- **Modern Frontend**: Developed using Next.js 14 for optimal performance and user experience.

## Tech Stack

- **Frontend**: 
  - **Framework**: [Next.js 14](https://nextjs.org/)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)

- **Backend**: 
  - **Service**: [Appwrite.io](https://appwrite.io/)
  - **Error Logging**: [Sentry](https://sentry.io/)

- **Bank Account Linking**: [Plaid](https://plaid.com/)
- **Money Transfers**: [Dwolla](https://www.dwolla.com/)

## Design

Explore the Figma design for the Horizon Banking App [here](https://www.figma.com/design/ppm3ylNgu7CWuc1Z5r3Iap/Horizon-Banking-App?node-id=10-5409&t=4fPrLEXbeHd0ZDzd-1).

## Installation

To set up the project locally:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/yourusername/horizon-banking-app.git
   cd horizon-banking-app
2. **Install dependencies**:
   ```sh
   npm install
3. **Set up environment variables**:

    Create a .env file in the root directory and add the required environment variables. Refer to .env.example for details.
4. **Start the development server**:
   ```sh
   npm run dev

## Usage
 
- **Link the bank account**: 
  - **Navigate to the Link Bank Account section.**
  - **Follow the instructions to link your bank account via Plaid.**

- **Transfer Money**: 
  - **Go to the Transfer Money section.**
  - **Enter the details to transfer money using Dwolla.**

- **Monitor Errors**: 
  - **Errors are logged in real-time with Sentry.**
  - **Access the Sentry dashboard for detailed reports.**

