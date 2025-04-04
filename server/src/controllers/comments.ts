import { Request, Response } from 'express';
import { Comment } from '../schema/comment';
import { sendEmail } from '../utility/utils';
import Member from '../schema/member';
async function sendNotification(
  email: string,
  commentData: any,
): Promise<void> {
  const emailOptions: any = {
    to: email,
    subject: 'New Comment Notification',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Comment Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background-color: #4CAF50; color: #ffffff; text-align: center; padding: 20px;">
            <h1 style="margin: 0;">New Comment on ${commentData.currentStudyName}</h1>
          </div>
          <div style="padding: 20px;">
            <p style="color: #333333;">Hello,</p>
            <p style="color: #333333;">A new comment has been added to your case by <strong style="color: #4CAF50;">${commentData.currentUserEmail}</strong>.</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
              <h3 style="color: #4CAF50; margin-top: 0;">Details:</h3>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 10px;"><strong>Stage:</strong> <span style="color: #4CAF50;">${commentData.currentStage}</span></li>
                <li style="margin-bottom: 10px;"><strong>Phase:</strong> <span style="color: #4CAF50;">${commentData.currentPhase}</span></li>
              </ul>
            </div>
            <div style="background-color: #e9f5e9; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
              <h3 style="color: #4CAF50; margin-top: 0;">Comment:</h3>
              <p style="color: #333333; font-style: italic;">"${commentData.comment}"</p>
            </div>
            <p style="color: #333333;">Please log in to your account to view the full details and respond if necessary.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="#" style="background-color: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Comment</a>
            </div>
            <p style="color: #666666; font-size: 14px; margin-top: 30px; text-align: center;">Thank you for using our service.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await sendEmail(emailOptions);
}
export const createComment = async (req: Request, res: Response) => {
  try {
    const newComment = new Comment(req.body);
    await newComment.save();

    await sendNotification(newComment.currentUserEmail, newComment);
    await sendNotification(newComment.currentPatientEmail, newComment);

    res.status(201).json({
      message: 'Comment created successfully and notification sent.',
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating comment', error });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const {
      currentPatientEmail,
      currentStage,
      currentPhase,
      currentStudyName,
    } = req.query;

    const query: any = {};

    if (currentPatientEmail) query.currentPatientEmail = currentPatientEmail;
    if (currentStage) query.currentStage = currentStage;
    if (currentPhase) query.currentPhase = currentPhase;
    if (currentStudyName) query.currentStudyName = currentStudyName;

    const comments = await Comment.find(query);

    const uniqueEmails = [
      ...new Set(comments.map((comment) => comment.currentUserEmail)),
    ];
    const members = await Member.find(
      { email: { $in: uniqueEmails } },
      { email: 1, userType: 1 },
    );

    const emailToUserTypeMap = new Map(
      members.map((member) => [member.email, member.userType]),
    );

    const commentsWithUserType = comments.map((comment) => ({
      ...comment.toObject(),
      userType: emailToUserTypeMap.get(comment.currentUserEmail) || 'unknown',
    }));

    res.status(200).json(commentsWithUserType);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching comments', error });
  }
};
export const updateComment = async (req: Request, res: Response) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating comment', error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting comment', error });
  }
};
