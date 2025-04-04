import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from '@nextui-org/react';
import { FcEditImage, FcFullTrash, FcPlus } from 'react-icons/fc';
import { toast } from 'react-toastify';

import { CommentBoxProps, CommentData, CommentDisplayProps } from '@/types';
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from '@/helpers/axiosCalls';
import UserAvatar from '@/components/UserProfileImage';

const CommentCard = ({
  comment,
  showAddNewComment,
  openEditModal,
  handleDeleteComment,
}: any) => {
  const userInfoString = localStorage.getItem('user');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

  const formatComment = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <Card className="mb-4">
      <CardBody className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <UserAvatar
              description={comment.userType}
              email={comment.currentUserEmail}
            />
          </div>

          {showAddNewComment && (
            <div className="flex space-x-2">
              {comment.currentUserEmail === userInfo.email && (
                <>
                  <Tooltip content="Edit">
                    <Button
                      isIconOnly
                      className="p-1"
                      color="primary"
                      variant="light"
                      onPress={() => openEditModal(comment)}
                    >
                      <FcEditImage size={25} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button
                      isIconOnly
                      className="p-1"
                      color="danger"
                      variant="light"
                      onPress={() => handleDeleteComment(comment._id)}
                    >
                      <FcFullTrash size={25} />
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-3">{formatComment(comment.comment)}</p>

        <div className="flex justify-between text-end text-sm text-gray-500">
          <p>{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
      </CardBody>
    </Card>
  );
};

export const CommentBox: React.FC<CommentBoxProps> = ({
  currentUserEmail,
  currentPatientEmail,
  currentStage,
  currentPhase,
  currentStudyName,
  onCommentAdded,
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCommentChange = (e: any) => {
    const newComment = e.target.value;
    setComment(newComment);
    if (newComment.trim()) {
      setErrorMessage('');
    }
  };

  const formatComment = (text: string) => {
    return text.split('\n').join('\n');
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setErrorMessage('Please enter a comment.');

      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const formattedComment = formatComment(comment.trim());
      const commentData: any = {
        currentUserEmail,
        currentPatientEmail,
        currentStage,
        currentPhase,
        currentStudyName,
        comment: formattedComment,
      };

      await addComment(commentData);
      setComment('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
      <Textarea
        className="w-full"
        errorMessage={errorMessage}
        isInvalid={!!errorMessage}
        label="Add a comment"
        maxRows={5}
        minRows={2}
        placeholder="Type your comment here..."
        value={comment}
        onBlur={() => {
          if (!comment.trim()) {
            setErrorMessage('Please enter a comment.');
          }
        }}
        onChange={handleCommentChange}
      />
      <Button
        className="self-end mt-2"
        disabled={!comment.trim() || isSubmitting}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        Add Message <FcPlus size={25} />
      </Button>
    </div>
  );
};

export const CommentDisplay: React.FC<CommentDisplayProps> = ({
  currentUserEmail,
  currentPatientEmail,
  currentStage,
  currentPhase,
  currentStudyName,
  showAddNewComment,
  phaseProgress,
}) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingComment, setEditingComment] = useState<CommentData | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getComments({
        currentUserEmail,
        currentPatientEmail,
        currentStage,
        currentPhase,
        currentStudyName,
      });
      setComments(response.data);
    } catch (error) {
      toast.error('Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserEmail, currentPatientEmail, currentStage, currentPhase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentAdded = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleUpdateComment = async (
    commentId: string,
    updatedText: string
  ) => {
    try {
      await updateComment(commentId, { comment: updatedText });
      toast.success('Comment updated successfully');
      fetchComments();
      onClose();
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const openEditModal = (comment: CommentData) => {
    setEditingComment(comment);
    onOpen();
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {comments.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Conversation</h2>
          </CardHeader>
          <Divider />

          <CardBody>
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <Spinner size="lg" />
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment, index) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  commentsLength={comments.length}
                  handleDeleteComment={handleDeleteComment}
                  index={index}
                  openEditModal={openEditModal}
                  showAddNewComment={showAddNewComment}
                />
              ))
            ) : (
              <></>
            )}
          </CardBody>
        </Card>
      ) : (
        <></>
      )}

      {showAddNewComment && phaseProgress && (
        <CommentBox
          currentPatientEmail={currentPatientEmail}
          currentPhase={currentPhase}
          currentStage={currentStage}
          currentStudyName={currentStudyName}
          currentUserEmail={currentUserEmail}
          onCommentAdded={handleCommentAdded}
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Comment</ModalHeader>
              <ModalBody>
                <Textarea
                  defaultValue={editingComment?.comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingComment(
                      editingComment
                        ? { ...editingComment, comment: e.target.value }
                        : null
                    )
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() =>
                    editingComment &&
                    handleUpdateComment(
                      editingComment._id,
                      editingComment.comment
                    )
                  }
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
