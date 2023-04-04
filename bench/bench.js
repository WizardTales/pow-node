'use strict';

import autocannon from 'autocannon';

function startBench () {
  const url = 'http://0.0.0.0:5000';

  autocannon({
    url,
    connections: 1000,
    amount: 100000,
    requests: [
      {
        method: 'POST',
        path: '/api/v1/pow/config',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: 'W3auQXo0E3DZIvIfQJNPr5q1xbi7d6Cp' }),
        onResponse: (status, body, context) => {
          if (status === 200) {
            context.string = JSON.parse(body).string;
          }
        }
      },
      {
        method: 'POST',
        setupRequest: (req, context) => ({
          ...req,
          headers: {
            'Content-Type': 'application/json'
          },
          path: `/api/v1/pow/verify`,
          body: JSON.stringify({
            string: context.string,
            key: 'W3auQXo0E3DZIvIfQJNPr5q1xbi7d6Cp',
            nonce: 54216,
            result: '340282354776231385719405387413152675435'
          })
        })
      }
    ]
  }, finishedBench);

  function finishedBench (err, res) {
    console.log('finished bench', err, res);
  }
}

startBench();
