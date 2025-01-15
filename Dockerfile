FROM oven/bun:1

COPY . .

RUN bun install

CMD [ "bun", "src/index.ts" ]