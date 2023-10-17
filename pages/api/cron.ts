import { GraphQLClient, gql } from 'graphql-request'
import { NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server'

export default async (req: NextRequest, res: NextApiResponse) => {
  console.log('getting token');
  const access_token = await getToken();

  const graphQLClient = new GraphQLClient("https://www.warcraftlogs.com/api/v2/client", {
    headers: {
      authorization: `Bearer ${access_token}`,
    },
  });

  console.log('client setup');
  const nextResp = await getRankings(graphQLClient);
  console.log(nextResp);
  return res.status(200).json(nextResp);
};

async function getToken() {
  const body = new URLSearchParams({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    client_id: process.env.WCL_CLIENT_ID!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    client_secret: process.env.WCL_CLIENT_SECRET!,
    grant_type: "client_credentials",
  }).toString();

  const response = await fetch("https://www.warcraftlogs.com/oauth/token", {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const json = await response.json();
  return json.access_token;
}

async function getRankings(graphQLClient: GraphQLClient) {
  const document = gql`{
    worldData {
      encounter(id: 2688) {
        characterRankings(difficulty: 5, partition: 4, includeCombatantInfo: true, className: "Monk", specName: "Brewmaster")
      }
    }
  }`

  const response = await graphQLClient.request(document);
  console.log(response);
  return response;
}