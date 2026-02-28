import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './styles/Gallery.css';

const Gallery = () => {
    const { currentUser } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        category: 'church',
        image: null
    });
    const [categories] = useState([
        'church',
        'nature',
        'culture',
        'festival',
        'manuscript',
        'other'
    ]);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        setLoading(true);
        try {
             
            // For now, use sample images
const sampleImages = [
    {
        id: 1,
        url: "https://www.bing.com/th/id/OIP.vYjENuTvjxMHa8N8XqYVmwHaE6?w=198&h=128&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
        title: "Bet Giyorgis",
        description: "The iconic Church of St. George in Lalibela, 12th century",
        category: "church",
        uploadedBy: "admin",
        uploadedAt: new Date().toISOString(),
        likes: 97,
        comments: 34
    },
    {
        id: 2,
        url: "https://th.bing.com/th/id/OIP.tQMuWJCmX8KhTIcZ5oNw6wHaLS?w=109&h=108&c=7&qlt=90&bgcl=15fd4d&r=0&o=6&dpr=1.7&pid=13.1",
        title: "Orthodox Priest with Processional Cross",
        description: "Elderly priest holding a traditional Lalibela cross",
        category: "people",
        uploadedBy: "admin",
        uploadedAt: new Date().toISOString(),
        likes: 81,
        comments: 19
    },
    {
        id: 3,
        url: "https://www.bing.com/th/id/OIP.HMIJfXSfnohDJRkL2rfGuAHaFc?w=193&h=142&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
        title: "Bet Maryam Church",
        description: "One of the most beautiful rock-hewn churches in Lalibela",
        category: "church",
        uploadedBy: "admin",
        uploadedAt: new Date().toISOString(),
        likes: 89,
        comments: 26
    },
    {
        id: 4,
        url: "https://c8.alamy.com/comp/T58711/ethiopian-holy-day-epiphany-timket-begin-celebrated-in-gonder-january-192019-T58711.jpg",
        title: "Timket Celebration",
        description: "Orthodox faithful celebrating Epiphany in Gondar",
        category: "festival",
        uploadedBy: "admin",
        uploadedAt: new Date().toISOString(),
        likes: 93,
        comments: 29
    },
    {
     id: 4,
        url: "https://sacred-sites.org/wp-content/uploads/2018/09/ethiopia.png",
        title: "Debre Berhan Selassie Church",
        description: "Famous church in Gondar with angel-covered ceiling,this image old one.",
        category: "church",
        uploadedBy: "admin",
        uploadedAt: new Date().toISOString(),
        likes: 91,
        comments: 27
    }
];               
            setImages(sampleImages);
        } catch (error) {
            console.error('Error loading images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.image) return;

        try {
            // In a real app, this would upload to cloud storage
            const reader = new FileReader();
            reader.onload = async (event) => {
                const newImage = {
                    id: Date.now(),
                    url: event.target.result,
                    title: uploadData.title,
                    description: uploadData.description,
                    category: uploadData.category,
                    uploadedBy: currentUser?.username || 'Anonymous',
                    uploadedAt: new Date().toISOString(),
                    likes: 0,
                    comments: 0
                };
                setImages(prev => [newImage, ...prev]);
                setUploadModal(false);
                setUploadData({
                    title: '',
                    description: '',
                    category: 'church',
                    image: null
                });
            };
            reader.readAsDataURL(uploadData.image);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleLike = (imageId) => {
        setImages(prev => prev.map(img => 
            img.id === imageId 
                ? { ...img, likes: img.likes + 1 }
                : img
        ));
    };

    const filterByCategory = (category) => {
        if (category === 'all') {
            loadImages();
        } else {
            setImages(prev => prev.filter(img => img.category === category));
        }
    };

    return (
        <section className="card" id="gallery">
            <h2 className="section-title">ምስሎች - Photo Gallery</h2>
            
            <div className="gallery-controls">
                <div className="category-filters">
                    <button onClick={() => filterByCategory('all')}>All</button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => filterByCategory(cat)}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
                
                {currentUser && (
                    <button 
                        className="upload-btn"
                        onClick={() => setUploadModal(true)}
                    >
                        <i className="fas fa-upload"></i> Upload Photo
                    </button>
                )}
            </div>

            {loading ? (
                <div className="gallery-loading">
                    <i className="fas fa-spinner fa-spin"></i> Loading gallery...
                </div>
            ) : (
                <div className="gallery-grid">
                    {images.map(image => (
                        <div 
                            key={image.id} 
                            className="gallery-item"
                            onClick={() => setSelectedImage(image)}
                        >
                            <img src={image.url} alt={image.title} loading="lazy" />
                            <div className="gallery-overlay">
                                <h3>{image.title}</h3>
                                <p>{image.description}</p>
                                <div className="gallery-meta">
                                    <span>
                                        <i className="fas fa-heart"></i> {image.likes}
                                    </span>
                                    <span>
                                        <i className="fas fa-comment"></i> {image.comments}
                                    </span>
                                    <span>
                                        <i className="fas fa-user"></i> {image.uploadedBy}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="image-modal" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedImage(null)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <img src={selectedImage.url} alt={selectedImage.title} />
                        <div className="image-details">
                            <h3>{selectedImage.title}</h3>
                            <p>{selectedImage.description}</p>
                            <div className="image-meta">
                                <span>
                                    <i className="fas fa-calendar"></i> 
                                    {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                                </span>
                                <span>
                                    <i className="fas fa-tag"></i> {selectedImage.category}
                                </span>
                                <button 
                                    className="like-btn"
                                    onClick={() => handleLike(selectedImage.id)}
                                >
                                    <i className="fas fa-heart"></i> {selectedImage.likes}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {uploadModal && (
                <div className="upload-modal" onClick={() => setUploadModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Upload Photo</h3>
                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={e => setUploadData({...uploadData, title: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={e => setUploadData({...uploadData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={uploadData.category}
                                    onChange={e => setUploadData({...uploadData, category: e.target.value})}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setUploadData({...uploadData, image: e.target.files[0]})}
                                    required
                                />
                            </div>
                            
                            {uploadData.image && (
                                <div className="image-preview">
                                    <img src={URL.createObjectURL(uploadData.image)} alt="Preview" />
                                </div>
                            )}
                            
                            <div className="modal-actions">
                                <button type="submit">Upload</button>
                                <button type="button" onClick={() => setUploadModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;