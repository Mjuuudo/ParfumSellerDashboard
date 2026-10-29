FROM node:22
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
RUN npm install lucide-react
CMD ["npm", "run", "dev"] 