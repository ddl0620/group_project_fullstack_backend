import bcrypt from "bcryptjs";

export const isMatchEncrypt = async (
    inputData: string,
    destinationData: string,
) => {
    if (!inputData || !destinationData) {
        return false;
    }

    return await bcrypt.compare(inputData, destinationData)
};
