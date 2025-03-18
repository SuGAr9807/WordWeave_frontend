import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';

// Define the types for our data
interface Comment {
  comment_id?: string;
  user: string;
  text: string;
  username: string;
}

interface Like {
  user: string;
  username: string;
  text: string;
}

interface BlogPost {
  post_id: string;
  title: string;
  content: string;
  user: string;
  tags: string[];
  likes: Like[];
  commentCount: number;
  comments: Comment[];
  created_at: string;
  username: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  profile_picture: string;
  is_active: boolean;
  date_joined: string;
}

const BlogDetailPage: React.FC = () => {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>('');
  const { post_id } = useParams<{ post_id: string }>();
  
  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          // User is not logged in
          return;
        }
        
        const response = await fetch('http://127.0.0.1:8000/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error fetching current user:', err);
        // Don't set error state here to avoid breaking the blog display
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch blog post data
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/blogs-list/${Number(post_id)}`);
        const data = await response.json();
        setBlog(data);
        setError(null);
      } catch (err) {
        setError('Failed to load blog post. Please try again later.');
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (post_id) {
      fetchBlogPost();
    }
  }, [post_id]);

  // Determine if the current user has liked the post
  const isLikedByCurrentUser = currentUser?.email 
    ? blog?.likes.some(like => like.user === currentUser.email) 
    : false;

  const handleLikeToggle = async () => {
    if (!blog || likeInProgress) return;
    
    try {
      setLikeInProgress(true);
      
      // Get the authentication token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('You must be logged in to like posts');
        setLikeInProgress(false);
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/like-post/${blog.post_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
      
      // Fetch the updated blog post to get the accurate likes list
      const updatedBlogResponse = await fetch(`http://127.0.0.1:8000/blogs-list/${Number(post_id)}`);
      const updatedBlog = await updatedBlogResponse.json();
      setBlog(updatedBlog);
      
    } catch (err) {
      setError('Failed to update like status. Please try again.');
      console.error('Error toggling like:', err);
    } finally {
      setLikeInProgress(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    
    try {
      setSubmittingComment(true);
      setCommentError(null);
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setCommentError('You must be logged in to comment');
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/blogs/${blog?.post_id}/comment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      // Clear the comment input
      setCommentText('');
      
      // Refresh the blog post to get the updated comments
      const updatedBlogResponse = await fetch(`http://127.0.0.1:8000/blogs-list/${Number(post_id)}`);
      const updatedBlog = await updatedBlogResponse.json();
      setBlog(updatedBlog);
      
    } catch (err) {
      setCommentError('Failed to submit comment. Please try again.');
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle editing a comment
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.comment_id || null);
    setEditCommentText(comment.text);
  };

  // Handle updating a comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentText.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    
    try {
      setSubmittingComment(true);
      setCommentError(null);
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setCommentError('You must be logged in to edit comments');
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/comments/${commentId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: editCommentText })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      
      // Reset editing state
      setEditingCommentId(null);
      setEditCommentText('');
      
      // Refresh the blog post to get the updated comments
      const updatedBlogResponse = await fetch(`http://127.0.0.1:8000/blogs-list/${Number(post_id)}`);
      const updatedBlog = await updatedBlogResponse.json();
      setBlog(updatedBlog);
      
    } catch (err) {
      setCommentError('Failed to update comment. Please try again.');
      console.error('Error updating comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setCommentError('You must be logged in to delete comments');
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/comments/${commentId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      // Refresh the blog post to get the updated comments
      const updatedBlogResponse = await fetch(`http://127.0.0.1:8000/blogs-list/${Number(post_id)}`);
      const updatedBlog = await updatedBlogResponse.json();
      setBlog(updatedBlog);
      
    } catch (err) {
      setCommentError('Failed to delete comment. Please try again.');
      console.error('Error deleting comment:', err);
    }
  };

  // Cancel editing a comment
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 rounded-lg mt-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg mt-8">
        <p className="text-gray-500">Blog post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Blog Header */}
        <div className="p-6 pb-0">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{blog.title}</h1>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <span className="font-medium">By {blog.username}</span>
              <span className="mx-2">•</span>
              <time dateTime={blog.created_at}>
                {format(new Date(blog.created_at), 'MMMM d, yyyy')}
              </time>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleLikeToggle}
                disabled={likeInProgress || !currentUser}
                className={`flex items-center transition-colors duration-200 ${
                  isLikedByCurrentUser 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-red-500'
                } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!currentUser ? "Log in to like" : isLikedByCurrentUser ? "Unlike" : "Like"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-1" 
                  fill={isLikedByCurrentUser ? "currentColor" : "none"} 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={isLikedByCurrentUser ? 1 : 2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                {blog.likes.length}
              </button>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {blog.commentCount}
              </span>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="px-6 mb-4">
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Blog Content */}
        <div className="px-6 mb-6">
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
        
        {/* Comments Section */}
        <div className="border-t border-gray-200">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Comments ({blog.commentCount})</h3>
            
            {/* Add comment form */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Add a comment
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={submittingComment}
                  />
                  {commentError && (
                    <p className="mt-1 text-sm text-red-600">{commentError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submittingComment}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    submittingComment ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submittingComment ? 'Submitting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700">
                  Please <span className="text-blue-600 font-medium">log in</span> to leave a comment.
                </p>
              </div>
            )}
            
            {/* Comments list */}
            {blog.comments.length > 0 ? (
              <div className="space-y-4">
                {blog.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-700 mb-1">{comment.username}</div>
                    
                    {/* Show edit form if editing this comment */}
                    {editingCommentId === comment.comment_id ? (
                      <div>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          disabled={submittingComment}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateComment(comment.comment_id!)}
                            disabled={submittingComment}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            {submittingComment ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600">{comment.text}</p>
                        
                        {/* Show edit/delete buttons if current user is the comment author */}
                        {currentUser && currentUser.email === comment.user && (
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.comment_id!)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetailPage;