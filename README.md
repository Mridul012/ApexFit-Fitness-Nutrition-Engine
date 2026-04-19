# ApexFit: Adaptive Fitness & Nutrition Engine

## Live Hosted Link
  https://apex-fit-fitness-nutrition-engine.vercel.app


## Introduction

ApexFit is a smart fitness and nutrition tracking app with a custom backend system. It helps users log their daily activities and gives simple suggestions on what to improve.

## Problem

Many people want to get fit but struggle to stay consistent. Even when they track their food and workouts, they don’t understand what the numbers mean. Because of this, they don’t know how to adjust their routine when progress slows down.

## Solution

ApexFit acts like a simple automated coach. The flow is easy: the user logs meals and workouts, the system processes this data, and then gives personalized suggestions to help the user stay on track.

## Key Features

* **User Authentication**: Secure signup and login
* **Meal Tracking**: Log daily food intake (calories, protein, carbs, fats)
* **Workout Tracking**: Record exercises and calories burned
* **Progress Tracking**: Track body weight over time
* **Recommendation System**: Gives suggestions based on user activity and goals

## Tech Stack

* **Frontend**: React (with TypeScript)
* **Backend**: Node.js, Express
* **Database**: MySQL
* **ORM**: Prisma

## System Design

The system uses a rule-based recommendation approach. Instead of complex AI, it uses simple logic (like checking weekly calorie or protein intake). Data is stored in a structured way (meals, workouts, progress), which helps keep the system fast and easy to manage.

## API Endpoints (Basic)

Some main endpoints used in the project:

* `POST /api/auth/login`
* `POST /api/meals`
* `POST /api/workouts`
* `GET /api/progress`
* `GET /api/recommendations`

## Future Improvements

* **Better recommendations**: Add more rules for different fitness goals
* **Analytics dashboard**: Show weekly insights and charts
* **Mobile app**: Build a mobile version for easier tracking

## Conclusion

ApexFit shows how simple backend logic can turn raw data into useful advice. By keeping the system clean and easy to understand, it helps users stay consistent and improve their fitness over time.


