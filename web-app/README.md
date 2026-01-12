# Exam Explorer web app
This folder contains the Exam Explorer web application, available at:  
https://exam-explorer.tuna-systems.com

The web app is written in [Svelte](https://github.com/sveltejs/) and includes a minimal backend with a database as its data source.

# Developing

After cloning the repository, install dependencies using `pnpm install`, start the development server:
```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building
To create a production build:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

## Hosting
A Dockerized version of the app is automatically built and published at:  
https://github.com/WolverinDEV/tucan-exam-explorer/pkgs/container/tucan-exam-explorer


A minimal `docker-compose.yml` setup may look like this:
```yml
version: "3.7"
services:
  svelte:
    image: ghcr.io/wolverindev/tucan-exam-explorer:master
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://postgres:my-password@database/exam-explorer
      # Please configure the remaining environment variables based on .env.example

  database:
    image: postgres:16
    restart: always
    shm_size: 128mb
    environment:
      POSTGRES_PASSWORD: my-password
      POSTGRES_DB: exam-explorer
    volumes:
      - ./pgdata:/var/lib/postgresql/data
```