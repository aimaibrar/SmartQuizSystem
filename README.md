# Smart Quiz System 🎓

## Overview

Smart Quiz System is a full-stack web application designed to automate and manage academic quizzes in a secure and efficient manner. The platform enables students to participate in timed quizzes over a local network while providing administrators with comprehensive tools for question management and performance monitoring.

The project combines modern backend technologies with AI-powered features to create an interactive and scalable assessment system.

---

## Features ✨

* AI-powered question generation
* Server-side timer enforcement with automatic submission
* Role-based access control for students and administrators
* Real-time quiz sessions with instant grading
* Complete result history and performance tracking
* Secure user authentication and authorization
* Quiz and question management dashboard
* Local network deployment without cloud dependency

---

## Tech Stack 🛠

### Backend

* Java 21
* Spring Boot
* Hibernate / JPA
* Maven

### Database

* MySQL

### Frontend

* HTML
* CSS
* JavaScript

### Additional Technologies

* REST APIs
* AI Integration

---

## System Roles

### Student

* Register and log in to the system
* Participate in quizzes
* View scores and quiz history
* Receive instant grading and feedback

### Administrator

* Manage users
* Create and manage quizzes
* Generate questions using AI
* Monitor quiz sessions
* Access student performance records

---

## Core Functionalities

### AI-Powered Question Generation

The system integrates AI to automatically generate quiz questions, reducing manual effort and improving content creation.

### Timed Quiz Sessions

Quiz timers are enforced on the server side to ensure fairness and automatically submit quizzes when time expires.

### Instant Evaluation

Student submissions are evaluated in real time, and results are immediately displayed.

### Performance Tracking

The application maintains detailed records of quiz attempts and scores for future analysis.

---

## Project Architecture

The application follows a client-server architecture:

* Frontend: HTML, CSS, JavaScript
* Backend: Spring Boot REST APIs
* Database: MySQL
* ORM Layer: Hibernate / JPA
* Build Tool: Maven

---

## Installation and Setup

### Prerequisites

* Java 21
* Maven
* MySQL
* IntelliJ IDEA or VS Code

### Steps

1. Clone the repository:

```bash
git clone https://github.com/aimaibrar/SmartQuizSystem.git
```

2. Configure the database connection in:

```text
backend/src/main/resources/application.properties
```

3. Build the project:

```bash
./mvnw clean install
```

4. Run the Spring Boot application:

```bash
./mvnw spring-boot:run
```

5. Open the frontend in your browser and start using the application.

---

## Learning Outcomes

This project strengthened my understanding of:

* Full-stack development
* RESTful API design
* Database modeling and management
* Spring Boot and Hibernate
* Authentication and authorization
* Scheduling and timer management
* AI integration
* Software architecture and problem-solving

---

## Author

**Aima Ibrar**

Cyber Security Student at UET Lahore

Developed as a full-stack educational technology project.
