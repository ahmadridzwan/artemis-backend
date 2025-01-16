## Prerequisites

### MongoDB / MongoDB Atlas

Set up a new cluster on [MongoDB](https://www.mongodb.com/) and take note of the connection string to be used later in the `.env` file. This project will later create the collections `predefinedblocks`, `userblocks`, and `users` in the database.

### Cloudinary

[Cloudinary](https://cloudinary.com/) is set up in this API to simplify the uploads of icon assets used in this project. Set up a free account on Cloudinary and take note of the `Cloud Name`, `API Key`, and `API Secret`.

---

## Getting Started

First, create a `.env` file in the root of the project. In this, the following values will be placed:

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

An example of a complete `.env` file should look like this:

```bash
MONGO_URI=mongodb+srv://artemis:<password>@cluster.adwbs.mongodb.net/?retryWrites=true&w=majority&appName=test-cluster
JWT_SECRET=<secret>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

Next, install dependencies by running:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

The API server will be running at [http://localhost:5000](http://localhost:5000), unless a different port was specified in the `.env` file.

---

## Creating Users

As the frontend project does not include a user registration page, this will be done directly through the API server with the help of an API program like Postman or Insomnia, for example.

The most important user in this project is the `admin`, as they will be responsible for creating Blocks to be used by the normal users. Once an `admin` user is created, a normal user can then be created to interact with the Blocks.

### Creating admin user

```bash
curl --request POST \
  --url http://localhost:5055/api/auth/register \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.3.0' \
  --data '{
  "username": "testadmin",
  "password": "password123",
  "isAdmin": true
}
'
```

### Creating normal user

```bash
curl --request POST \
  --url http://localhost:5055/api/auth/register \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.3.0' \
  --data '{
  "username": "testuser",
  "password": "password123"
}
'
```

---

## Creating Blocks

1. Log in to the [frontend application](localhost:3000) with an `admin` user
2. Choose to create either `single` or `grouped` Block type
3. Click `Add Block` to create a new Block

### Adding Block(s) to a user

1. Log in to the [frontend application](localhost:3000) with a normal user
2. Select the Blocks to add to the user. There are two types of Blocks; `single` and `grouped`. For any user, they can only choose and have ONE `single` type Block. If they already have one `single` Block saved, they will not be able to add any further Blocks until they have deleted their `single` Block. For `grouped` Blocks, a user may add more than one at any time. This validation is performed in both the frontend and backend applications
