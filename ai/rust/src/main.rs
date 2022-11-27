use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};

mod state;

#[derive(Deserialize, Clone, Debug)]
struct MoveRequest {
    vline: Vec<Vec<u8>>,
    hline: Vec<Vec<u8>>,
}

#[derive(Serialize)]
struct MoveResponse {
    r#type: String,
    location: [usize; 2],
}

#[get("/")]
async fn test() -> impl Responder {
    HttpResponse::Ok().body("It works!")
}

#[post("/move")]
async fn next_move(req_body: web::Json<MoveRequest>) -> impl Responder {
    println!("{:#?}", req_body);
    let score = state::State::start_minimax(req_body.clone().hline, req_body.into_inner().vline);
    let response = MoveResponse {
        r#type: match score.vertical {
            true => String::from("v"),
            false => String::from("h"),
        },
        location: [score.row, score.column],
    };
    HttpResponse::Ok().json(response)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(next_move).service(test))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
