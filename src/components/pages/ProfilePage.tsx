import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the user data type based on your API response
interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  profile_picture: string;
  is_active: boolean;
  date_joined: string;
}

// Define the blog data structure
interface BlogPost {
  post_id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
}

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userBlogs, setUserBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [blogsLoading, setBlogsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Make sure the auth token is included in the request headers
        const response = await axios.get('http://127.0.0.1:8000/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}` // Assuming you store your token in localStorage
          }
        });
        setUserData(response.data);
        setLoading(false);
        
        // Once we have the user data, fetch their blogs
        fetchUserBlogs(response.data.id);
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
        console.error('Error fetching profile data:', err);
      }
    };

    const fetchUserBlogs = async (userId: string) => {
      setBlogsLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/blogs-list/${userId}/user-posts/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setUserBlogs(response.data);
        setBlogsLoading(false);
      } catch (err) {
        setBlogsError('Failed to load blog posts. Please try again later.');
        setBlogsLoading(false);
        console.error('Error fetching user blogs:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleEditBlog = (blogId: string) => {
    navigate(`/edit-blog/${blogId}`);
  };

  const handleCreateBlog = () => {
    navigate('/write');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">No user data found.</div>
      </div>
    );
  }

  // Format the date_joined to be more readable
  const formattedDate = new Date(userData.date_joined).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format blog date
  const formatBlogDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* User Profile Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
        
        <div className="flex flex-col md:flex-row p-6">
          <div className="flex justify-center md:w-1/3 mb-6 md:mb-0">
            {userData.profile_picture ? (
              <img 
                src={userData.profile_picture} 
                alt={`${userData.name}'s profile`} 
                className="rounded-full w-32 h-32 object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="rounded-full w-32 h-32 bg-gray-300 flex items-center justify-center text-gray-500 text-2xl border-4 border-white shadow-lg">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <div className="mb-4">
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-gray-600">@{userData.username}</p>
            </div>
            
            <div className="space-y-4">
              {/* Email on one line */}
              <div className="border-b pb-3">
                <p className="text-gray-500 text-sm">Email</p>
                <p>{userData.email}</p>
              </div>
              
              {/* Other three data points on one line */}
              <div className="flex flex-wrap">
                <div className="mr-6">
                  <p className="text-gray-500 text-sm">Member Since</p>
                  <p>{formattedDate}</p>
                </div>
                
                <div className="mr-6">
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className={userData.is_active ? "text-green-600" : "text-red-600"}>
                    {userData.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">User ID</p>
                  <p className="text-gray-600 text-sm">{userData.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t p-6">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mr-3"
            onClick={() => console.log('Edit profile clicked')}
          >
            Edit Profile
          </button>
          <button 
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100"
            onClick={() => console.log('Change password clicked')}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* User Blogs Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Blog Posts</h2>
          <button 
            onClick={handleCreateBlog}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-md"
          >
            Write New Blog
          </button>
        </div>
        
        <div className="p-6">
          {blogsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg">Loading blogs...</div>
            </div>
          ) : blogsError ? (
            <div className="text-red-500 py-4">{blogsError}</div>
          ) : userBlogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't written any blog posts yet.</p>
              <button 
                onClick={handleCreateBlog}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
              >
                Create Your First Blog
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {userBlogs.map((blog) => (
                <div key={blog.post_id} className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="md:flex">
                    {blog.image_url && (
                      <div className="md:w-1/4">
                        <img 
                          src={blog.image_url} 
                          alt={blog.title} 
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-4 ${blog.image_url ? 'md:w-3/4' : 'w-full'}`}>
                      <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                      <div 
                            className="text-gray-600 mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{ 
                              __html: blog.content.length > 150 
                                ? blog.content.substring(0, 150) + '...' 
                                : blog.content 
                            }} 
                          />
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex space-x-4">
                          <span>👍 {blog.likes} Likes</span>
                          <span>💬 {blog.comments} Comments</span>
                          <span>📅 {formatBlogDate(blog.created_at)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditBlog(blog.post_id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => navigate(`/blog/${blog.post_id}`)}
                            className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded-md text-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;