import { Driver } from "../models/Driver";

export const addOrUpdateDriver = async (driverData: any) => {
  const { id, name, phoneNumber, location, socketId } = driverData;

  let driver = await Driver.findOne({ id });
  if (driver) {
    driver.name = name;
    driver.phoneNumber = phoneNumber;
    driver.location = location;
    driver.socketId = socketId;
    await driver.save();
  } else {
    driver = new Driver(driverData);
    await driver.save();
  }

  return driver;
};

export const removeDriverBySocketId = async (socketId: string) => {
  await Driver.deleteOne({ socketId });
};