/**
 * Takes a team number and turns it into 10.TE.AM.2 to connect to the roboRIO
 * @param teamNumber
 * @returns
 */
export const teamNumberToIP = (teamNumber: number) => {
	const string = Math.floor(teamNumber).toString();
	return `10.${string.slice(0, 2)}.${string.slice(2, 4).replace(/^0/, '')}.2:5810`;
};
