const express = require('express');
const axios = require('axios');

const router = express.Router();

/* POST directline token. */
router.post('/directline/token', (req, res) => {
  console.log(req.body);
  if (req.body && req.body.user && req.body.password && req.body.user === 'v2soft' && req.body.password === 's3cr3t') {
    let tokenURL = '';
    let requestType = '';
    if (req.body.conversationId) {
      tokenURL = `https://directline.botframework.com/v3/directline/conversations/${req.body.conversationId}`;
      requestType = 'get';
    } else {
      tokenURL = 'https://directline.botframework.com/v3/directline/tokens/generate';
      requestType = 'post';
    }
    axios.request({
      url: tokenURL,
      method: requestType,
      headers: {
        Authorization: `Bearer ${process.env.DIRECTLINE_SECRET}`
      }
    })
      .then((response) => {
        // /conversation returns 201 && /tokens/generate returns 200
        if (response.status === 201 || response.status === 200) {
          res.json({
            ...response.data,
            success: true
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.json({
          error,
          success: false
        });
      });
  } else {
    res.status(401).json({
      success: false
    });
  }
});

router.post('/directline/reconnect', (req, res) => {
  console.log(req.body);
  if (req.body && req.body.conversationId) {
    let tokenURL = '';
    tokenURL = `https://directline.botframework.com/v3/directline/conversations/${req.body.conversationId}`;
    axios.request({
      url: tokenURL,
      method: 'get',
      headers: {
        Authorization: `Bearer ${process.env.DIRECTLINE_SECRET}`
      }
    })
      .then((response) => {
        if (response.status === 200) {
          res.json({
            ...response.data,
            success: true
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.json({
          error,
          success: false
        });
      });
  } else {
    res.status(401).json({
      success: false
    });
  }
});

module.exports = router;
