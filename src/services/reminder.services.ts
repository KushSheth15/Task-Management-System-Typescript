import cron from 'node-cron';
import db from '../sequelize-client';
import { sendEmail } from '../utils/mailer';
import { Op } from 'sequelize';

const setupCronJobs = ()=>{
    cron.schedule('0 9 * * *', async () => {
        try {
            const reminders = await db.Reminder.findAll({
                where: {
                    reminderDate: {
                        [Op.between]: [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)],
                    }
                },
                include: [{
                    model: db.Task,
                    as:'task',
                    include: [{ model: db.User, as: 'user' }]
                }],
            });
    
            for (const reminder of reminders) {
                const task = reminder.task;
                const user = task?.user;
    
                if (task && user) {
                    await sendEmail({
                        to: user.email,
                        subject:'Task Reminder',
                        text:`Reminder: The task "${task.title}" is due on ${task.dueDate}.`,
                    })
                }
            }
        } catch (error) {
            console.error('Error sending task reminders:', error);
        }
    })
}

export default setupCronJobs;
