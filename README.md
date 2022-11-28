# uvec-fall-2022

## Installation

TODO max

## Design Decisions / Division of Labour

We chose a microservice architecture because it offered us the flexibility of independently deploying our software. We were able to split into frontend, backend, and AI service teams. This really assisted with testing, as we could all tunnel our dev machines out and test in real time, providing a blazing fast 🚀 🚀 🚀 🚀 🚀 🚀  feedback loop.

Additionally, it allows a plug-and-play dev experience with algorithms, where new algorithms can (in theory) be written and enabled on runtime.

We chose TypeScript for our frontend and backend since JSON provides a nice way to RPC in a native way. We stored the entire game state on the server and only sent serialized RPCs to the server. Every time the client mutates the game state, it is sent to the client. This ensures that the client's state is always accurate to what the server sees, and makes the logic for validating the client's behaviour only have to live in one place.

We chose Rust for the AI beacause it's blazing fast, 🚀 🚀 🚀 🚀. This allows our algorithm to have a very fast runtime simply by choice of programming language. We chose Rust over other performant languages because it provides the most safety on compile time, ensuring high reliability and performance. Out backend was stateless as well, allowing sharding for the more compute-heavy part of our product.

The B.a.D. program uses a minimax algorithm with alpha-beta pruning to solve the game. It calculates all moves up to a specified depth, except for when a branch is dominated by the opponent’s decisions due to the alpha-beta optimization. The complexity is factorial based on the number of possible moves and the recursion depth. For example, if there are 8 possible moves and the algorithm calculates to a depth of 3, the complexity is 8\*7\*6. So, there is a constant value that can be found for any hardware to give the maximum possible depth within a reasonable time. We didn’t have time to implement that functionality in the code, so for now the maximum depth is set to 9. This provides good processing times with standard boards up to about size 5 (depending on the hardware), but may take a long time for larger boards. Nonetheless, calculating all possible moves up to 9 makes it stronger than most human players.

We also wrote a random algorithm in Python. It was only used for testing and not in prod. It simply picked a random line.

## Libraries 

For our Typescript backend, we used Express, and our frontend used NextJS. We chose not to serve the entire project from NextJS because of the aforementioned microservice descision. We were able to edit and push code independently without risking merge conflicts. Also the clean separation of frontend and backend is nice.

For the Rust AI, we used Actix to provide good web server performance and a mature ecosystem. It was written by the Tokio project so it integrates very well with async.

## Future Work

Since the AI can predict many moves ahead, we considered adding an eval bar similar to chess engines like Stockfish. The AI returns a `score` parameter in its data, but we did not have time to implement it in the backend or frontend.

Multiple users are able to play at the same time, but they cannot play against each other, only against the bot. Future work could make multiplayer work without any architectural changes.

Variable depth could be added to minimax, which could add different difficulty ratings for the bot. This could be pretty easily implemented.