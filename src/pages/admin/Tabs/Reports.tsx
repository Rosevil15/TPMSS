import React, { useState } from 'react';
import {IonContent,IonPage,IonCard,IonCardHeader,IonCardTitle,IonCardContent,IonButton,IonGrid,IonRow,IonCol,IonIcon,IonToast,IonSpinner,IonProgressBar,useIonViewWillEnter,IonSkeletonText,} from '@ionic/react';
import {documentTextOutline,peopleOutline,medkitOutline,schoolOutline,briefcaseOutline,downloadOutline,statsChartOutline,} from 'ionicons/icons';
import { fetchStatistics, generateCasesReport, generateEducationReport, generateHealthReport, generateLocationBreakdownReport, generateProfilesReport, generateSummaryReport, getLocationFilterText, loadAvailableLocations, LocationFilter } from '../../../services/reportServices';
import { EarlyWarningCase, fetchEarlyWarnings, generateEarlyWarningReport, WarningStats } from '../../../services/earlyWarning';
import EarlyWarningDashboard from '../../../components/EarlyWarningDashboard';
import LocationFilterCard from '../../../components/LocationFilterCard';


const Reports: React.FC = () => {
  const [statistics, setStatistics] = useState({
    totalProfiles: 0,
    totalHealthRecords: 0,
    totalEducationRecords: 0,
    totalCases: 0,
    pregnantCount: 0,
    enrolledCount: 0,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('');
  const [progress, setProgress] = useState(0);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarningCase[]>([]);
  const [warningStats, setWarningStats] = useState<WarningStats>({
    totalHighRisk: 0,
    totalRepeatedPregnancy: 0,
    totalDropouts: 0,
  });

  const [locationFilter, setLocationFilter] = useState<LocationFilter>({
    filterType: 'all',
    region: '',
    province: '',
    municipality: '',
    barangay: '',
  });

  const [availableLocations, setAvailableLocations] = useState({
    regions: [] as string[],
    provinces: [] as string[],
    municipalities: [] as string[],
    barangays: [] as string[],
  });

  useIonViewWillEnter(() => {
    loadData();
  });
  const [dataLoading, setDataLoading] = useState(true);
  const loadData = async () => {
    try {
      setDataLoading(true);
      const stats = await fetchStatistics(locationFilter);
      setStatistics(stats);

      const locations = await loadAvailableLocations();
      setAvailableLocations(locations);

      const { warnings, stats: wStats } = await fetchEarlyWarnings(locationFilter);
      setEarlyWarnings(warnings);
      setWarningStats(wStats);
    } catch (error) {
      console.error('Error loading data:', error);
      setToastMessage('Error loading data');
      setShowToast(true);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLocationFilterChange = (field: keyof LocationFilter, value: any) => {
    setLocationFilter(prev => ({ ...prev, [field]: value }));
  };

  const clearLocationFilter = () => {
    setLocationFilter({
      filterType: 'all',
      region: '',
      province: '',
      municipality: '',
      barangay: '',
    });
  };

  const applyFilter = async () => {
    try {
      const stats = await fetchStatistics(locationFilter);
      setStatistics(stats);

      const { warnings, stats: wStats } = await fetchEarlyWarnings(locationFilter);
      setEarlyWarnings(warnings);
      setWarningStats(wStats);

      setToastMessage('Filter applied successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error applying filter:', error);
      setToastMessage('Error applying filter');
      setShowToast(true);
    }
  };

  const simulateProgress = async (duration: number) => {
    return new Promise<void>((resolve) => {
      let currentProgress = 0;
      const steps = 20;
      const stepDuration = duration / steps;

      const interval = setInterval(() => {
        currentProgress += 100 / steps;
        setProgress(Math.min(currentProgress, 100));

        if (currentProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setProgress(0);
            resolve();
          }, 200);
        }
      }, stepDuration);
    });
  };

  const handleGenerateReport = async (type: string) => {
    setLoading(true);
    setReportType(type);
    setProgress(0);

    try {
      const progressPromise = simulateProgress(2000);
      const locationText = getLocationFilterText(locationFilter);

      switch (type) {
        case 'summary':
          await progressPromise;
          await generateSummaryReport(statistics, locationText);
          break;

        case 'profiles':
          await generateProfilesReport(locationFilter, locationText);
          await progressPromise;
          break;

        case 'health':
          await generateHealthReport(locationFilter, locationText);
          await progressPromise;
          break;

        case 'education':
          await generateEducationReport(locationFilter, locationText);
          await progressPromise;
          break;

        case 'cases':
          await generateCasesReport(locationFilter, locationText);
          await progressPromise;
          break;

        case 'breakdown':
          await generateLocationBreakdownReport(locationFilter);
          await progressPromise;
          break;

        case 'warnings':
          await progressPromise;
          await generateEarlyWarningReport(earlyWarnings, warningStats, locationText);
          break;

        default:
          throw new Error('Invalid report type');
      }

      setToastMessage('Report generated successfully!');
      setShowToast(true);
    } catch (error: any) {
      console.error('Error generating report:', error);
      setToastMessage(error.message || 'Error generating report');
      setShowToast(true);
    } finally {
      setLoading(false);
      setReportType('');
      setProgress(0);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {loading && (
          <div style={{ marginBottom: '20px', padding: '0 10px' }}>
            <IonProgressBar value={progress / 100} color="primary" />
            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
              Generating report... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Location Filter Card */}
        <LocationFilterCard
          locationFilter={locationFilter}
          availableLocations={availableLocations}
          onFilterChange={handleLocationFilterChange}
          onApplyFilter={applyFilter}
          onClearFilter={clearLocationFilter}
          getLocationFilterText={() => getLocationFilterText(locationFilter)}
         
        />
        
        {/* Early Warning Dashboard */}
        <EarlyWarningDashboard
          earlyWarnings={earlyWarnings}
          warningStats={warningStats}
          loading={loading}
          reportType={reportType}
          onGenerateReport={() => handleGenerateReport('warnings')}
        />

        

        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Statistics Overview</h2>

        {dataLoading ? (
          <IonCard style={{ marginBottom: '20px' }}>
            <IonCardContent>
              <IonGrid style={{ padding: 0 }}>
                <IonRow>
                  {[1, 2, 3, 4].map((item) => (
                    <IonCol size="12" sizeMd="6" sizeLg="3" key={item}>
                      <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center', marginBottom: '10px' }}>
                        <IonSkeletonText animated style={{ width: '32px', height: '32px', margin: '0 auto', borderRadius: '50%' }} />
                        <IonSkeletonText animated style={{ width: '60%', height: '36px', margin: '10px auto' }} />
                        <IonSkeletonText animated style={{ width: '80%', height: '14px', margin: '0 auto' }} />
                      </div>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ) : (
          // Statistics Cards
            <IonGrid style={{ padding: 0 }}>
              <IonRow>
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <IonCard style={{ background: '#3498db', color: 'white', margin: '8px 0', minHeight: '140px' }}>
                    <IonCardHeader>
                      <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={peopleOutline} style={{ fontSize: '24px', marginRight: '8px' }} />
                        Total Profiles
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <h1 style={{ fontSize: '36px', margin: '5px 0', fontWeight: 'bold' }}>{statistics.totalProfiles}</h1>
                      <p style={{ fontSize: '13px', margin: 0 }}>Registered teenage mothers</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <IonCard style={{ background: '#2980b9', color: 'white', margin: '8px 0', minHeight: '140px' }}>
                    <IonCardHeader>
                      <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={medkitOutline} style={{ fontSize: '24px', marginRight: '8px' }} />
                        Health Records
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <h1 style={{ fontSize: '36px', margin: '5px 0', fontWeight: 'bold' }}>{statistics.totalHealthRecords}</h1>
                      <p style={{ fontSize: '13px', margin: 0 }}>{statistics.pregnantCount} currently pregnant</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <IonCard style={{ background: '#5dade2', color: 'white', margin: '8px 0', minHeight: '140px' }}>
                    <IonCardHeader>
                      <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={schoolOutline} style={{ fontSize: '24px', marginRight: '8px' }} />
                        Education Records
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <h1 style={{ fontSize: '36px', margin: '5px 0', fontWeight: 'bold' }}>{statistics.totalEducationRecords}</h1>
                      <p style={{ fontSize: '13px', margin: 0 }}>{statistics.enrolledCount} currently enrolled</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <IonCard style={{ background: '#498cb9ff', color: 'white', margin: '8px 0', minHeight: '140px' }}>
                    <IonCardHeader>
                      <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={briefcaseOutline} style={{ fontSize: '24px', marginRight: '8px' }} />
                        Case Management
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <h1 style={{ fontSize: '36px', margin: '5px 0', fontWeight: 'bold' }}>{statistics.totalCases}</h1>
                      <p style={{ fontSize: '13px', margin: 0 }}>Total cases managed</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
        )}
        <h2 style={{ marginTop: '30px', fontSize: '20px', marginBottom: '15px' }}>Generate Reports</h2>
        <IonGrid style={{ padding: 0 }}>
          <IonRow>
            <IonCol size="12" sizeMd="6" sizeLg="4">
              <IonCard style={{ margin: '8px 0', minHeight: '200px', borderLeft: '4px solid #9b59b6' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={statsChartOutline} style={{ marginRight: '8px', fontSize: '20px', color: '#9b59b6' }} />
                    Location Breakdown
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '14px', minHeight: '60px' }}>
                    Generate detailed breakdown by sub-locations showing counts, average age, and enrollment status.
                    Select a Region, Province, or Municipality first.
                  </p>
                  <IonButton
                    expand="block"
                    onClick={() => handleGenerateReport('breakdown')}
                    disabled={loading || !['region', 'province', 'municipality'].includes(locationFilter.filterType)}
                    style={{ marginTop: '10px' }}
                    color="secondary"
                  >
                    {loading && reportType === 'breakdown' ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={downloadOutline} />
                        Download PDF
                      </>
                    )}
                  </IonButton>
                  {!['region', 'province', 'municipality'].includes(locationFilter.filterType) && (
                    <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '8px', marginBottom: 0 }}>
                      Please select a Region, Province, or Municipality filter
                    </p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="4">
              <IonCard style={{ margin: '8px 0', minHeight: '200px' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={documentTextOutline} style={{ marginRight: '8px', fontSize: '20px' }} />
                    Summary Report
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '14px', minHeight: '60px' }}>Generate a comprehensive summary report with all statistics and overview data.</p>
                  <IonButton
                    expand="block"
                    onClick={() => handleGenerateReport('summary')}
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                  >
                    {loading && reportType === 'summary' ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={downloadOutline} />
                        Download PDF
                      </>
                    )}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="4">
              <IonCard style={{ margin: '8px 0', minHeight: '200px' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={peopleOutline} style={{ marginRight: '8px', fontSize: '20px' }} />
                    Profiles Report
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '14px', minHeight: '60px' }}>Export all teenage mother profiles with complete demographic information.</p>
                  <IonButton
                    expand="block"
                    onClick={() => handleGenerateReport('profiles')}
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                  >
                    {loading && reportType === 'profiles' ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={downloadOutline} />
                        Download PDF
                      </>
                    )}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="4">
              <IonCard style={{ margin: '8px 0', minHeight: '200px' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={medkitOutline} style={{ marginRight: '8px', fontSize: '20px' }} />
                    Health Report
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '14px', minHeight: '60px' }}>Export maternal health records including pregnancy status and medical history.</p>
                  <IonButton
                    expand="block"
                    onClick={() => handleGenerateReport('health')}
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                  >
                    {loading && reportType === 'health' ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={downloadOutline} />
                        Download PDF
                      </>
                    )}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="4">
              <IonCard style={{ margin: '8px 0', minHeight: '200px' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={schoolOutline} style={{ marginRight: '8px', fontSize: '20px' }} />
                    Education Report
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '14px', minHeight: '60px' }}>Export education and training records with enrollment status and programs.</p>
                  <IonButton
                    expand="block"
                    onClick={() => handleGenerateReport('education')}
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                  >
                    {loading && reportType === 'education' ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={downloadOutline} />
                        Download PDF
                      </>
                    )}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="4">
              <IonCard style={{ margin: '8px 0', minHeight: '200px' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={briefcaseOutline} style={{ marginRight: '8px', fontSize: '20px' }} />
                    Case Management Report
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '14px', minHeight: '60px' }}>Export case management records with counseling and support information.</p>
                  <IonButton
                    expand="block"
                    onClick={() => handleGenerateReport('cases')}
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                  >
                    {loading && reportType === 'cases' ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={downloadOutline} />
                        Download PDF
                      </>
                    )}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Reports;