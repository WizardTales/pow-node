# Description

A reference production implementation for a pow captcha.
The API is compatible with the mcaptcha widget.

# Installation

To make this component working, you will need to pull in a browser widget
into the public folder. Or alternatively just use the API endpoints directly.

An example of a widget that this works with is the mcaptcha widget.

# Performance

This module was validated with

- 100k parallel connections. P99 latency of a full
  config and verify action was around 10s at full rate,
  average at 5s.
  Error rate of requests was only 0.268%
- 2k parallel connections. P99 latency of a full
  config and verify action was around 406ms at full rate,
  average at 134ms.
  Error rate of requests was 0%
- RP/s is roughly 20-30k config + verify actions (so 40-60k RP/s).

You can find an example bench in the benchmark folder, this numbers
are for our system and our equipment, your milage may vary. Never trust
a benchmark unless it is your own.

# Further scaling

This module was written first without any external connections.
If you really need more performance than this, there are strategies
for scaling beyond even without a database which are more efficient.

For us right now, the performance in its highly optimized form is enough.
Feel free to shoot PRs to add a version scalable beyond 100k concurrency.
