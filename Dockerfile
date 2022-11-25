FROM node:16-alpine As deps

WORKDIR /src/app

COPY package*.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

COPY . .

RUN pnpm run build

EXPOSE 4000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]