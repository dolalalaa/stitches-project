import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Customize_samee = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fabric, measurement } = location.state || {};
    
    const [loading, setLoading] = useState(true);
    const [mannequin, setMannequin] = useState(null);
    const [kurtas, setKurtas] = useState([]);
    const [sleeves, setSleeves] = useState([]);
    const [necks, setNecks] = useState([]);
    
    const [selectedKurta, setSelectedKurta] = useState(null);
    const [selectedSleeve, setSelectedSleeve] = useState(null);
    const [selectedNeck, setSelectedNeck] = useState(null);
    const [selectedLace, setSelectedLace] = useState(null);
    
    const [activeTab, setActiveTab] = useState('kurta');
    const [availableLaces, setAvailableLaces] = useState([]);
    
    const API_URL = 'http://localhost:5000';
    
    useEffect(() => {
        const fabricData = fabric || { name: "Test Fabric", image: null };
        const measurementData = measurement || { size: "large" };
        loadData(fabricData, measurementData);
    }, []);
    
    const loadData = async (fabricData, measurementData) => {
        try {
            setLoading(true);
            
            const mannequinRes = await axios.get(`${API_URL}/api/mannequin/${measurementData.size}`);
            setMannequin(mannequinRes.data);
            
            const kurtasRes = await axios.get(`${API_URL}/api/kurtas/${measurementData.size}`);
            setKurtas(kurtasRes.data);
            if (kurtasRes.data.length > 0) {
                setSelectedKurta(kurtasRes.data[0]);
                loadLacesForKurta(kurtasRes.data[0].name);
            }
            
            const sleevesRes = await axios.get(`${API_URL}/api/sleeves/${measurementData.size}`);
            setSleeves(sleevesRes.data);
            
            const necksRes = await axios.get(`${API_URL}/api/necks/${measurementData.size}`);
            setNecks(necksRes.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };
    
    const loadLacesForKurta = async (kurtaName) => {
        try {
            const lacesRes = await axios.get(`${API_URL}/api/laces/${kurtaName}`);
            setAvailableLaces(lacesRes.data);
        } catch (error) {
            console.error('Error loading laces:', error);
        }
    };
    
    // Simple Save Draft - Just navigate
    const handleSaveDraft = () => {
        navigate('/drafts', {
            state: {
                selectedKurta,
                selectedSleeve,
                selectedNeck,
                selectedLace,
                fabric,
                measurement
            }
        });
    };
    
    // Simple Confirm Order - Just navigate
    const handleConfirmOrder = () => {
        if (!selectedKurta) {
            alert('Please select a kurta first');
            return;
        }
        
        navigate('/order-summary', {
            state: {
                selectedKurta,
                selectedSleeve,
                selectedNeck,
                selectedLace,
                fabric,
                measurement
            }
        });
    };
    
    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading...</h2>
            </div>
        );
    }
    
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Customize Your Kurta</h1>
                <p>Size: {measurement?.size?.toUpperCase() || "LARGE"} | Fabric: {fabric?.name || "Test"}</p>
            </div>
            
            <div style={styles.main}>
                {/* 3D Viewer */}
                <div style={styles.viewer}>
                    <div style={styles.viewerPlaceholder}>
                        <h3>3D Preview</h3>
                        <p>Kurta: {selectedKurta?.displayName || 'None'}</p>
                        <p>Sleeve: {selectedSleeve?.name || 'None'}</p>
                        <p>Neck: {selectedNeck?.name || 'None'}</p>
                        <p>Lace: {selectedLace?.name || 'None'}</p>
                    </div>
                </div>
                
                {/* Controls */}
                <div style={styles.controls}>
                    <div style={styles.tabs}>
                        <button style={{...styles.tab, ...(activeTab === 'kurta' ? styles.activeTab : {})}} onClick={() => setActiveTab('kurta')}>KURTA</button>
                        <button style={{...styles.tab, ...(activeTab === 'sleeve' ? styles.activeTab : {})}} onClick={() => setActiveTab('sleeve')}>SLEEVES</button>
                        <button style={{...styles.tab, ...(activeTab === 'neck' ? styles.activeTab : {})}} onClick={() => setActiveTab('neck')}>NECKS</button>
                        <button style={{...styles.tab, ...(activeTab === 'lace' ? styles.activeTab : {})}} onClick={() => setActiveTab('lace')}>LACE</button>
                    </div>
                    
                    <div style={styles.tabContent}>
                        {activeTab === 'kurta' && (
                            <div style={styles.grid}>
                                {kurtas.map(kurta => (
                                    <div key={kurta._id} style={{...styles.card, ...(selectedKurta?._id === kurta._id ? styles.activeCard : {})}} onClick={() => setSelectedKurta(kurta)}>
                                        <img src={kurta.thumbnail} alt={kurta.name} style={styles.image} />
                                        <div style={styles.cardInfo}>
                                            <strong>{kurta.displayName}</strong>
                                        </div>
                                        {selectedKurta?._id === kurta._id && <div style={styles.checkmark}>✓</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {activeTab === 'sleeve' && (
                            <div style={styles.grid}>
                                <div style={{...styles.card, ...(!selectedSleeve ? styles.activeCard : {})}} onClick={() => setSelectedSleeve(null)}>
                                    <div style={styles.noImage}>No Sleeve</div>
                                    {!selectedSleeve && <div style={styles.checkmark}>✓</div>}
                                </div>
                                {sleeves.map(sleeve => (
                                    <div key={sleeve._id} style={{...styles.card, ...(selectedSleeve?._id === sleeve._id ? styles.activeCard : {})}} onClick={() => setSelectedSleeve(selectedSleeve?._id === sleeve._id ? null : sleeve)}>
                                        <img src={sleeve.thumbnail} alt={sleeve.name} style={styles.image} />
                                        <div style={styles.cardInfo}><strong>{sleeve.name}</strong></div>
                                        {selectedSleeve?._id === sleeve._id && <div style={styles.checkmark}>✓</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {activeTab === 'neck' && (
                            <div style={styles.grid}>
                                <div style={{...styles.card, ...(!selectedNeck ? styles.activeCard : {})}} onClick={() => setSelectedNeck(null)}>
                                    <div style={styles.noImage}>No Neck</div>
                                    {!selectedNeck && <div style={styles.checkmark}>✓</div>}
                                </div>
                                {necks.map(neck => (
                                    <div key={neck._id} style={{...styles.card, ...(selectedNeck?._id === neck._id ? styles.activeCard : {})}} onClick={() => setSelectedNeck(selectedNeck?._id === neck._id ? null : neck)}>
                                        <img src={neck.thumbnail} alt={neck.name} style={styles.image} />
                                        <div style={styles.cardInfo}><strong>{neck.name}</strong></div>
                                        {selectedNeck?._id === neck._id && <div style={styles.checkmark}>✓</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {activeTab === 'lace' && (
                            <div style={styles.grid}>
                                <div style={{...styles.card, ...(!selectedLace ? styles.activeCard : {})}} onClick={() => setSelectedLace(null)}>
                                    <div style={styles.noImage}>No Lace</div>
                                    {!selectedLace && <div style={styles.checkmark}>✓</div>}
                                </div>
                                {availableLaces.map(lace => (
                                    <div key={lace._id} style={{...styles.card, ...(selectedLace?._id === lace._id ? styles.activeCard : {})}} onClick={() => setSelectedLace(selectedLace?._id === lace._id ? null : lace)}>
                                        <img src={lace.thumbnail} alt={lace.name} style={styles.image} />
                                        <div style={styles.cardInfo}><strong>{lace.name}</strong></div>
                                        {selectedLace?._id === lace._id && <div style={styles.checkmark}>✓</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* TWO SIMPLE BUTTONS */}
                    <div style={styles.buttons}>
                        <button style={styles.draftBtn} onClick={handleSaveDraft}>
                            💾 Save Draft
                        </button>
                        <button style={styles.confirmBtn} onClick={handleConfirmOrder}>
                            ✅ Confirm Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        background: '#f5f5f5',
        minHeight: '100vh'
    },
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
    },
    main: {
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '20px'
    },
    viewer: {
        background: '#e0e0e0',
        borderRadius: '10px',
        padding: '20px',
        minHeight: '500px'
    },
    viewerPlaceholder: {
        background: '#ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    controls: {
        background: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #ddd',
        background: '#fafafa'
    },
    tab: {
        flex: 1,
        padding: '12px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    activeTab: {
        color: '#667eea',
        borderBottom: '2px solid #667eea',
        background: 'white'
    },
    tabContent: {
        padding: '15px',
        maxHeight: '400px',
        overflowY: 'auto'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px'
    },
    card: {
        position: 'relative',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.3s',
        background: 'white'
    },
    activeCard: {
        borderColor: '#667eea',
        boxShadow: '0 0 10px rgba(102,126,234,0.3)'
    },
    image: {
        width: '100%',
        height: '100px',
        objectFit: 'cover'
    },
    noImage: {
        width: '100%',
        height: '100px',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999'
    },
    cardInfo: {
        padding: '8px',
        textAlign: 'center'
    },
    checkmark: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        background: '#667eea',
        color: 'white',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px'
    },
    buttons: {
        display: 'flex',
        gap: '10px',
        padding: '15px',
        borderTop: '1px solid #ddd',
        background: '#fafafa'
    },
    draftBtn: {
        flex: 1,
        padding: '12px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    confirmBtn: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
    }
};

export default Customize_samee;