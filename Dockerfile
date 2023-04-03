FROM registry.dev0.wizardtales.com/comcon/pnpm:18
ENV TERM=xterm

USER node
WORKDIR /home/node

COPY node_modules /home/node/node_modules
COPY config.js package.json index.js /home/node/
COPY lib /home/node/lib
COPY public /home/node/public

EXPOSE 5000
CMD [ "node", "index.js" ]
