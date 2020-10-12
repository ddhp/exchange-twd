# EX
Scrape USD & GBP exchange rate to TWD from Cathay Bank Taiwan.

During 9am to 7pm(GMT+8), it updates every 2 minutes otherwise 30 mins

# Usage
- install docker
- `docker pull ddhp/exchange-twd:latest`
- `docker run -d -e API_URL=${YOUR_SLACK_API_URL} -e ON_DOCKER=true ddhp/exchange-twd`
