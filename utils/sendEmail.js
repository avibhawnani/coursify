import { createTransport } from "nodemailer";
export const sendEmail = async(to,subject,text)=>{
    const transporter = createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: "2525",
        auth: {
          user: "9c43619861ad11",
          pass: "f92119ff2389ac",
        }
      });

    await transporter.sendMail({to,subject,text});
}