# NextDNS TLD Blocker

This script manages automatic blocking and unblocking of TLDs (Top-Level Domains) using the NextDNS API. Blocking is activated during specific periods (days and hours) defined by environment variables. The script uses the Madrid time zone to determine when to apply or remove blocks.

**Use case:** I use this script to block all .com and .net domains on an AppleTV device connected to NextDNS. This is necessary because my children enjoy watching TV before going to school, and I prefer them to arrive on time :-)

## Deploying the Function to DigitalOcean

### Prerequisites

- DigitalOcean account
- [doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/) (DigitalOcean CLI) installed and configured
- [Node.js](https://nodejs.org/) installed

### Steps to Deploy

1. Clone this repository:

   ```bash
   git clone https://github.com/diegomarino/nextdns-tld-blocker.git
   cd nextdns-tld-blocker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Login to DigitalOcean using doctl:

   ```bash
   doctl auth init
   ```

4. Create a new namespace for your functions (if you haven't already):

   ```bash  
   doctl serverless namespaces create your-namespace-name
   ```

5. Deploy the function:

   ```bash  
   doctl serverless deploy . --namespace your-namespace-name
   ```

6. Once deployed, you can invoke your function using:

   ```bash  
   doctl serverless functions invoke your-namespace-name/your-function-name
   ```

## Configuration

### Environment Variables

To use this function, you need to set up the following environment variables in your `.env` file:

1. `NEXTDNS_API_TOKEN`: Your NextDNS API token
2. `NEXTDNS_PROFILE_ID`: Your NextDNS profile ID
3. `BLOCKED_TLDS`: Comma-separated list of TLDs to block (default: "com,net")
4. `BLOCK_TLDS_DAYS_PERIOD`: Comma-separated start and end days for blocking period (default: "1,5" for Monday to Friday)
5. `BLOCK_TLDS_HOURS_PERIOD`: Comma-separated start and end hours for blocking period (default: "6,9" for 6 AM to 9 AM)
6. `TIMEZONE`: Timezone to use for blocking period (default: "Europe/Madrid"). Make sure to use a valid IANA timezone identifier. You can find a list of [valid timezones here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## License

MIT
