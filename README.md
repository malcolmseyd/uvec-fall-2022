# uvec-fall-2022

## Installation

TODO max

## Design Decisions / Division of Labour

We chose a microservice architecture because it offered us the flexibility of independently deploying our software. We were able to split into frontend, backend, and AI service teams. This really assisted with testing, as we could all tunnel our dev machines out and test in real time, providing a blazing fast 🚀 🚀 🚀 🚀 🚀 🚀  feedback loop.

Additionally, it allows a plug-and-play dev experience with algorithms, where new algorithms can (in theory) be written and enabled on runtime.

We chose TypeScript for our frontend and backend since JSON provides a nice way to RPC in a native way. We stored the entire game state on the server and only sent serialized RPCs to the server. Every time the client mutates the game state, it is sent to the client. This ensures that the client's state is always accurate to what the server sees, and makes the logic for validating the client's behaviour only have to live in one place.

We chose Rust for the AI beacause it's blazing fast, 🚀 🚀 🚀 🚀. This allows our algorithm to have a very fast runtime simply by choice of programming language. We chose Rust over other performant languages because it provides the most safety on compile time, ensuring high reliability and performance.

## Libraries 

For our Typescript backend, we used Express, and our frontend used NextJS. We chose not to serve the entire project from NextJS because of the aforementioned microservice descision. We were able to edit and push code independently without risking merge conflicts. Also the clean separation of frontend and backend is nice.

For the Rust AI, we used Actix to provide good web server performance and a mature ecosystem. It was written by the Tokio project so it integrates very well with async.