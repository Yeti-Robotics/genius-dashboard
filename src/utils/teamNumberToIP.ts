/**
 * Takes a team number and turns it into 10.TE.AM.2 to connect to the roboRIO
 * @param teamNumber
 * @returns
 */
export const teamNumberToIP = (teamNumber: string) => {
	return `10.${teamNumber.slice(0, 2)}.${teamNumber.slice(2, 4)}.2:5810`;
};
