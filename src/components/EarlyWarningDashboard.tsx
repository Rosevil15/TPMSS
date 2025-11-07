import React, { useState, useRef, useEffect } from 'react';
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSkeletonText,
} from '@ionic/react';
import {
    warningOutline,
    alertCircleOutline,
    medkitOutline,
    schoolOutline,
    downloadOutline,
} from 'ionicons/icons';
import { EarlyWarningCase, WarningStats } from '../services/earlyWarning';

interface EarlyWarningDashboardProps {
    earlyWarnings: EarlyWarningCase[];
    warningStats: WarningStats;
    loading: boolean;
    reportType: string;
    onGenerateReport: () => void;
}

const EarlyWarningDashboard: React.FC<EarlyWarningDashboardProps> = ({
    earlyWarnings,
    warningStats,
    loading,
    reportType,
    onGenerateReport,
}) => {
    const [displayedWarnings, setDisplayedWarnings] = useState<EarlyWarningCase[]>([]);
    const [itemsToShow, setItemsToShow] = useState(10);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        // Reset when earlyWarnings changes
        setItemsToShow(10);
        setDisplayedWarnings(earlyWarnings.slice(0, 10));
    }, [earlyWarnings]);

    const loadMoreData = (ev: any) => {
        setTimeout(() => {
            const newItemsToShow = itemsToShow + ITEMS_PER_PAGE;
            setItemsToShow(newItemsToShow);
            setDisplayedWarnings(earlyWarnings.slice(0, newItemsToShow));
            ev.target.complete();

            // Disable infinite scroll when all items are loaded
            if (newItemsToShow >= earlyWarnings.length) {
                ev.target.disabled = true;
            }
        }, 500);
    };

    if (loading && earlyWarnings.length === 0 && reportType === '') {
        return (
            <IonCard style={{ marginBottom: '20px', borderLeft: '4px solid #e74c3c' }}>
                <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '18px', display: 'flex', alignItems: 'center', color: '#e74c3c' }}>
                        <IonIcon icon={warningOutline} style={{ fontSize: '24px', marginRight: '8px' }} />
                        Early Warning
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonGrid style={{ padding: 0 }}>
                        <IonRow>
                            {/* Skeleton for summary cards */}
                            {[1, 2, 3].map((item) => (
                                <IonCol size="12" sizeMd="4" key={item}>
                                    <div style={{ 
                                        padding: '15px', 
                                        background: '#f5f5f5', 
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        marginBottom: '10px'
                                    }}>
                                        <IonSkeletonText animated style={{ width: '32px', height: '32px', margin: '0 auto', borderRadius: '50%' }} />
                                        <IonSkeletonText animated style={{ width: '60%', height: '24px', margin: '5px auto' }} />
                                        <IonSkeletonText animated style={{ width: '80%', height: '13px', margin: '5px auto' }} />
                                        <IonSkeletonText animated style={{ width: '60%', height: '11px', margin: '0 auto' }} />
                                    </div>
                                </IonCol>
                            ))}
                        </IonRow>
                        
                        {/* Skeleton for warning list */}
                        <IonRow style={{ marginTop: '15px' }}>
                            <IonCol size="12">
                                <IonSkeletonText animated style={{ width: '40%', height: '15px', marginBottom: '10px' }} />
                                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <div key={item} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                            <IonSkeletonText animated style={{ width: '60%', height: '14px', marginBottom: '5px' }} />
                                            <IonSkeletonText animated style={{ width: '80%', height: '12px', marginBottom: '5px' }} />
                                            <IonSkeletonText animated style={{ width: '40%', height: '10px' }} />
                                        </div>
                                    ))}
                                </div>
                            </IonCol>
                        </IonRow>

                        <IonRow style={{ marginTop: '15px' }}>
                            <IonCol size="12">
                                <IonSkeletonText animated style={{ width: '100%', height: '44px', borderRadius: '8px' }} />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
            </IonCard>
        );
    }

    return (
        <IonCard style={{ marginBottom: '20px', borderLeft: '4px solid #e74c3c' }}>
            <IonCardHeader>
                <IonCardTitle style={{ fontSize: '18px', display: 'flex', alignItems: 'center', color: '#e74c3c' }}>
                    <IonIcon icon={warningOutline} style={{ fontSize: '24px', marginRight: '8px' }} />
                    Early Warning
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonGrid style={{ padding: 0 }}>
                    <IonRow>
                        <IonCol size="12" sizeMd="4">
                            <div style={{ 
                                padding: '15px', 
                                background: '#fee', 
                                borderRadius: '8px',
                                textAlign: 'center',
                                marginBottom: '10px'
                            }}>
                                <IonIcon icon={alertCircleOutline} style={{ fontSize: '32px', color: '#c0392b' }} />
                                <h3 style={{ fontSize: '24px', margin: '5px 0', color: '#c0392b', fontWeight: 'bold' }}>
                                    {warningStats.totalHighRisk}
                                </h3>
                                <p style={{ fontSize: '13px', margin: 0, color: '#666' }}>High Risk Cases</p>
                                <p style={{ fontSize: '11px', margin: 0, color: '#999' }}>(Both flags)</p>
                            </div>
                        </IonCol>
                        <IonCol size="12" sizeMd="4">
                            <div style={{ 
                                padding: '15px', 
                                background: '#fef5e7', 
                                borderRadius: '8px',
                                textAlign: 'center',
                                marginBottom: '10px'
                            }}>
                                <IonIcon icon={medkitOutline} style={{ fontSize: '32px', color: '#f39c12' }} />
                                <h3 style={{ fontSize: '24px', margin: '5px 0', color: '#f39c12', fontWeight: 'bold' }}>
                                    {warningStats.totalRepeatedPregnancy}
                                </h3>
                                <p style={{ fontSize: '13px', margin: 0, color: '#666' }}>Repeated Pregnancy</p>
                                <p style={{ fontSize: '11px', margin: 0, color: '#999' }}>(2+ pregnancies)</p>
                            </div>
                        </IonCol>
                        <IonCol size="12" sizeMd="4">
                            <div style={{ 
                                padding: '15px', 
                                background: '#ebf5fb', 
                                borderRadius: '8px',
                                textAlign: 'center',
                                marginBottom: '10px'
                            }}>
                                <IonIcon icon={schoolOutline} style={{ fontSize: '32px', color: '#3498db' }} />
                                <h3 style={{ fontSize: '24px', margin: '5px 0', color: '#3498db', fontWeight: 'bold' }}>
                                    {warningStats.totalDropouts}
                                </h3>
                                <p style={{ fontSize: '13px', margin: 0, color: '#666' }}>School Dropouts</p>
                                <p style={{ fontSize: '11px', margin: 0, color: '#999' }}>(Flagged status)</p>
                            </div>
                        </IonCol>
                    </IonRow>
                    
                    {/* Warning Cases List */}
                    {earlyWarnings.length > 0 && (
                        <IonRow style={{ marginTop: '15px' }}>
                            <IonCol size="12">
                                <h4 style={{ fontSize: '15px', marginBottom: '10px', fontWeight: 'bold' }}>
                                    Flagged Cases ({earlyWarnings.length})
                                </h4>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
                                    <IonList style={{ padding: 0 }}>
                                        {displayedWarnings.map((warning, index) => (
                                            <IonItem key={index} lines="full">
                                                <IonLabel>
                                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                                        {warning.name} 
                                                        {warning.riskLevel === 'high' && (
                                                            <IonBadge color="danger" style={{ marginLeft: '8px', fontSize: '10px' }}>
                                                                HIGH RISK
                                                            </IonBadge>
                                                        )}
                                                        {warning.riskLevel === 'medium' && (
                                                            <IonBadge color="warning" style={{ marginLeft: '8px', fontSize: '10px' }}>
                                                                MEDIUM RISK
                                                            </IonBadge>
                                                        )}
                                                    </h3>
                                                    <p style={{ fontSize: '12px', color: '#666', margin: '3px 0' }}>
                                                        Age: {warning.age} | {warning.location}
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                                        {warning.repeatedPregnancy && (
                                                            <IonBadge color="warning" style={{ fontSize: '10px' }}>
                                                                {warning.pregnancyCount}x Pregnancy
                                                            </IonBadge>
                                                        )}
                                                        {warning.schoolDropout && (
                                                            <IonBadge color="primary" style={{ fontSize: '10px' }}>
                                                                School Dropout
                                                            </IonBadge>
                                                        )}
                                                    </div>
                                                </IonLabel>
                                            </IonItem>
                                        ))}
                                    </IonList>

                                    {/* Infinite Scroll */}
                                    {displayedWarnings.length < earlyWarnings.length && (
                                        <IonInfiniteScroll onIonInfinite={loadMoreData} threshold="100px">
                                            <IonInfiniteScrollContent
                                                loadingSpinner="bubbles"
                                                loadingText="Loading more cases..."
                                            />
                                        </IonInfiniteScroll>
                                    )}
                                </div>
                                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
                                    Showing {displayedWarnings.length} of {earlyWarnings.length} cases. 
                                    {displayedWarnings.length < earlyWarnings.length && ' Scroll down to load more.'}
                                </p>
                            </IonCol>
                        </IonRow>
                    )}

                    <IonRow style={{ marginTop: '15px' }}>
                        <IonCol size="12">
                            <IonButton
                                expand="block"
                                color="primary"
                                onClick={onGenerateReport}
                                disabled={loading || earlyWarnings.length === 0}
                            >
                                {loading && reportType === 'warnings' ? (
                                    <IonSpinner name="crescent" />
                                ) : (
                                    <>
                                        <IonIcon slot="start" icon={downloadOutline} />
                                        Download Full Early Warning Report
                                    </>
                                )}
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonCardContent>
        </IonCard>
    );
};

export default EarlyWarningDashboard;