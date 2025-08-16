// components/BlogManagement.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  BookOpen,
  Edit,
  Eye,
  Save,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  Link,
  Quote,
  X,
  Trash,
  Clock,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const BlogManagement = ({ user, userProfile }) => {
  // State Management
  const [blogPosts, setBlogPosts] = useState([]);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Shipping Guidelines",
    image: "",
    tags: [],
    readTime: "5 min read",
    status: "draft",
    featured: false,
  });
  const [currentTag, setCurrentTag] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const blogCategories = [
    "Festival Guides",
    "Shipping Guidelines",
    "Travel Tips",
    "Safety & Security",
    "Platform Updates",
    "Success Stories",
    "International Shipping",
    "Customer Support",
  ];

  // Fetch blog posts
  const fetchBlogPosts = useCallback(async () => {
    try {
      const q = query(
        collection(db, "blogPosts"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setBlogPosts(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      showNotification("Failed to fetch blog posts", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showNotification("Please select an image file", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image size should be less than 5MB", "error");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async () => {
    if (!imageFile) return blogForm.image;

    setUploadingImage(true);
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `blog-images/${timestamp}-${imageFile.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const storageRef = ref(storage, filename);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, imageFile);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification("Failed to upload image", "error");
      return blogForm.image;
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete image from storage
  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes("firebase")) return;

    try {
      // Extract the path from the URL
      const decodedUrl = decodeURIComponent(imageUrl);
      const startIndex = decodedUrl.indexOf("/blog-images/");
      const endIndex = decodedUrl.indexOf("?");

      if (startIndex !== -1) {
        const path = decodedUrl.substring(
          startIndex + 1,
          endIndex !== -1 ? endIndex : undefined
        );
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // Handle create or edit blog
  const handleCreateOrEditBlog = () => {
    setShowBlogEditor(true);
    setPreviewMode(false);
    setImageFile(null);
    setImagePreview("");
  };

  // Handle edit blog
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      image: blog.image,
      tags: blog.tags || [],
      readTime: blog.readTime,
      status: blog.status,
      featured: blog.featured || false,
    });
    setImagePreview(blog.image);
    setShowBlogEditor(true);
    setPreviewMode(false);
  };

  // Handle delete blog
  const handleDeleteBlog = async (blogId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }
    try {
      // Delete the image from storage if it exists
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }

      // Delete the blog post document
      await deleteDoc(doc(db, "blogPosts", blogId));
      await fetchBlogPosts();
      showNotification("Blog post deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting blog:", error);
      showNotification("Failed to delete blog post", "error");
    }
  };

  // Handle save blog
  const handleSaveBlog = async () => {
    if (!blogForm.title || !blogForm.excerpt || !blogForm.content) {
      showNotification("Please fill in all required fields", "warning");
      return;
    }

    setSaving(true);
    try {
      // Upload image if a new one is selected
      let imageUrl = blogForm.image;
      if (imageFile) {
        imageUrl = await uploadImage();

        // Delete old image if updating
        if (
          editingBlog &&
          editingBlog.image &&
          editingBlog.image !== imageUrl
        ) {
          await deleteImageFromStorage(editingBlog.image);
        }
      }

      const blogData = {
        ...blogForm,
        image: imageUrl,
        authorId: user.uid,
        authorName: userProfile.displayName || user.email.split("@")[0],
        authorEmail: user.email,
        updatedAt: serverTimestamp(),
        views: editingBlog ? editingBlog.views : 0,
        slug:
          editingBlog?.slug ||
          blogForm.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, ""),
      };

      if (editingBlog) {
        await updateDoc(doc(db, "blogPosts", editingBlog.id), blogData);
        showNotification("Blog post updated successfully!", "success");
      } else {
        blogData.createdAt = serverTimestamp();
        blogData.date = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        await addDoc(collection(db, "blogPosts"), blogData);
        showNotification("Blog post created successfully!", "success");
      }

      await fetchBlogPosts();
      handleCloseBlogEditor();
    } catch (error) {
      console.error("Error saving blog:", error);
      showNotification("Failed to save blog post", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle close blog editor
  const handleCloseBlogEditor = () => {
    setShowBlogEditor(false);
    setEditingBlog(null);
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      category: "Shipping Guidelines",
      image: "",
      tags: [],
      readTime: "5 min read",
      status: "draft",
      featured: false,
    });
    setCurrentTag("");
    setPreviewMode(false);
    setImageFile(null);
    setImagePreview("");
  };

  // Handle add tag
  const handleAddTag = () => {
    if (currentTag.trim() && !blogForm.tags.includes(currentTag.trim())) {
      setBlogForm({
        ...blogForm,
        tags: [...blogForm.tags, currentTag.trim()],
      });
      setCurrentTag("");
    }
  };

  // Handle remove tag
  const handleRemoveTag = (tagToRemove) => {
    setBlogForm({
      ...blogForm,
      tags: blogForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Handle publish toggle
  const handlePublishToggle = async (post) => {
    try {
      const newStatus = post.status === "published" ? "draft" : "published";
      await updateDoc(doc(db, "blogPosts", post.id), { status: newStatus });
      await fetchBlogPosts();
      showNotification(
        `Post ${
          newStatus === "published" ? "published" : "unpublished"
        } successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error updating post status:", error);
      showNotification("Failed to update post status", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : notification.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : notification.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : notification.type === "error" ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Blog Management</h2>
        <button
          onClick={handleCreateOrEditBlog}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Create New Post
        </button>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-4">
        {blogPosts.length > 0 ? (
          blogPosts.map((post) => (
            <div
              key={post.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    {post.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {post.category}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {post.views || 0} views
                    </span>
                    <span>By {post.authorName}</span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded-lg ml-4"
                  />
                )}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditBlog(post)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    title="Edit post"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handlePublishToggle(post)}
                    className={`p-2 rounded-lg ${
                      post.status === "published"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                    title={
                      post.status === "published" ? "Unpublish" : "Publish"
                    }
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(post.id, post.image)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    title="Delete post"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No blog posts yet. Create your first post!</p>
          </div>
        )}
      </div>

      {/* Blog Editor Modal */}
      {showBlogEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {previewMode ? "Edit" : "Preview"}
                  </button>
                  <button
                    onClick={handleCloseBlogEditor}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {!previewMode ? (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={blogForm.title}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter blog title"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt *
                    </label>
                    <textarea
                      value={blogForm.excerpt}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, excerpt: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent h-20"
                      placeholder="Brief description of the blog post"
                    />
                  </div>

                  {/* Category and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={blogForm.category}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, category: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        {blogCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={blogForm.status}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, status: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  {/* Featured Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Image
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                        {imageFile && (
                          <span className="text-sm text-gray-600">
                            {imageFile.name}
                          </span>
                        )}
                        {uploadingImage && (
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        )}
                      </div>
                      {(imagePreview || blogForm.image) && (
                        <div className="relative">
                          <img
                            src={imagePreview || blogForm.image}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview("");
                              setBlogForm({ ...blogForm, image: "" });
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Maximum file size: 5MB. Supported formats: JPG, PNG,
                        GIF, WebP
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <div className="border rounded-lg">
                      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                        <button
                          type="button"
                          onClick={() => {
                            const selection = window.getSelection().toString();
                            if (selection) {
                              setBlogForm({
                                ...blogForm,
                                content: blogForm.content.replace(
                                  selection,
                                  `**${selection}**`
                                ),
                              });
                            }
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Bold"
                        >
                          <Bold size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const selection = window.getSelection().toString();
                            if (selection) {
                              setBlogForm({
                                ...blogForm,
                                content: blogForm.content.replace(
                                  selection,
                                  `*${selection}*`
                                ),
                              });
                            }
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Italic"
                        >
                          <Italic size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBlogForm({
                              ...blogForm,
                              content: blogForm.content + "\n\n- List item",
                            });
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="List"
                        >
                          <List size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBlogForm({
                              ...blogForm,
                              content: blogForm.content + "\n\n> Quote",
                            });
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Quote"
                        >
                          <Quote size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt("Enter URL:");
                            const text = prompt("Enter link text:");
                            if (url && text) {
                              setBlogForm({
                                ...blogForm,
                                content:
                                  blogForm.content + ` [${text}](${url})`,
                              });
                            }
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Link"
                        >
                          <Link size={16} />
                        </button>
                      </div>
                      <textarea
                        value={blogForm.content}
                        onChange={(e) => {
                          setBlogForm({
                            ...blogForm,
                            content: e.target.value,
                            readTime: calculateReadTime(e.target.value),
                          });
                        }}
                        className="w-full px-4 py-2 focus:outline-none min-h-[300px]"
                        placeholder="Write your blog content here... (Supports Markdown)"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports Markdown formatting. Estimated read time:{" "}
                      {blogForm.readTime}
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {blogForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-purple-500 hover:text-purple-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={blogForm.featured}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, featured: e.target.checked })
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Mark as Featured Post
                    </label>
                  </div>
                </div>
              ) : (
                /* Preview Mode */
                <div className="prose max-w-none">
                  <h1 className="text-3xl font-bold mb-4">
                    {blogForm.title || "Untitled"}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {blogForm.category}
                    </span>
                    <span>{blogForm.readTime}</span>
                    {blogForm.featured && (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  {(imagePreview || blogForm.image) && (
                    <img
                      src={imagePreview || blogForm.image}
                      alt={blogForm.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  <p className="text-lg text-gray-600 mb-6">
                    {blogForm.excerpt}
                  </p>
                  <div className="whitespace-pre-wrap">{blogForm.content}</div>
                  {blogForm.tags.length > 0 && (
                    <div className="flex gap-2 mt-6 flex-wrap">
                      {blogForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl">
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCloseBlogEditor}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBlog}
                  disabled={saving || uploadingImage}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingBlog ? "Update Post" : "Save Post"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
