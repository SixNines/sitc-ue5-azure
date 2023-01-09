# syntax=docker/dockerfile:1

FROM golang:1.16-alpine

WORKDIR /app

COPY src/go.mod ./
COPY src/go.sum ./
RUN go mod download

COPY src/*.go ./

RUN go build -o /sitc-sales-demo

EXPOSE 9100 

CMD [ "/sitc-sales-demo" ]
