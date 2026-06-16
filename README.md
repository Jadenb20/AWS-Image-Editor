# AWS AI Image Editor

## Overview
A cloud-native AI image editor that allows users to upload photos and remove unwanted objects from them using generative AI. Built entirely with AWS services — no backend server required.

## Live Architecture
The application is fully serverless, with each AWS service handling a specific responsibility:

| Service | Role |
|---|---|
| **AWS Amplify** | Hosts and deploys the frontend web application |
| **Amazon Cognito** | Handles user authentication and secure access |
| **AWS API Gateway** | Exposes a REST API that the frontend calls |
| **AWS Lambda** | Runs the backend logic serverlessly when the API is called |
| **Amazon Bedrock** | Powers the AI image editing (object removal) |
| **AWS IAM** | Manages permissions and access control between services |

## How It Works
1. User signs in via **Cognito** authentication
2. User uploads an image and selects the object to remove
3. The frontend calls the **API Gateway** endpoint
4. **Lambda** is triggered and sends the request to **Amazon Bedrock**
5. **Bedrock** processes the image using generative AI and removes the selected object
6. The edited image is returned to the user

## Features
- User authentication and secure sessions
- AI-powered object removal from images
- Fully serverless — no backend infrastructure to manage
- Deployed and hosted on the cloud via AWS Amplify

## Tech Stack
- **Frontend** – HTML, CSS, JavaScript
- **Backend** – AWS Lambda (serverless)
- **AI** – Amazon Bedrock (generative AI)
- **Auth** – Amazon Cognito
- **API** – AWS API Gateway
- **Hosting** – AWS Amplify
- **Security** – AWS IAM

## Files
| File | Description |
|---|---|
| `index.html` | Main frontend page |
| `styles.css` | Application styling |
| `js/` | Frontend JavaScript logic and API calls |

## Notes
- AWS credentials and Amplify configuration files have been excluded from this repository
- To deploy your own version, set up the AWS services listed above and update the API Gateway endpoint in the frontend code
