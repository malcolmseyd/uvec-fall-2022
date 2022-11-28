FROM rust:1.64.0

WORKDIR /usr/src

# Download the target for static linking.
RUN rustup target add x86_64-unknown-linux-musl

COPY Cargo.toml Cargo.lock ./
COPY src ./src

ENV RUSTFLAGS="-C target-cpu=native"

RUN cargo build --release

EXPOSE 3002

CMD ["/usr/src/target/release/uvec_2022_fall"]
