import { Team } from "@libs/models/team";
import { WebClient as SlackClient } from "@slack/web-api/dist/WebClient";

export const getSlackClientForTeam = async (
  teamId: string
): Promise<SlackClient> => {
  const { Item: team } = await Team.get({ id: teamId });
  if (team === undefined) {
    throw new Error(`Team "${teamId}" doesn't exist`);
  }

  return new SlackClient(team.accessToken);
};
