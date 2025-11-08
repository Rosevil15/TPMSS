import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../utils/supabaseClients';

export interface LocationFilter {
    filterType: 'all' | 'region' | 'province' | 'municipality' | 'barangay';
    region: string;
    province: string;
    municipality: string;
    barangay: string;
}

export const buildLocationQuery = (query: any, locationFilter: LocationFilter) => {
    if (locationFilter.filterType === 'all') return query;
    if (locationFilter.filterType === 'region' && locationFilter.region) {
        return query.eq('region', locationFilter.region);
    }
    if (locationFilter.filterType === 'province' && locationFilter.province) {
        return query.eq('province', locationFilter.province);
    }
    if (locationFilter.filterType === 'municipality' && locationFilter.municipality) {
        return query.eq('municipality', locationFilter.municipality);
    }
    if (locationFilter.filterType === 'barangay' && locationFilter.barangay) {
        return query.eq('barangay', locationFilter.barangay);
    }
    return query;
};

export const getLocationFilterText = (locationFilter: LocationFilter) => {
    if (locationFilter.filterType === 'all') return 'All Locations';
    if (locationFilter.filterType === 'region') return `Region: ${locationFilter.region}`;
    if (locationFilter.filterType === 'province') return `Province: ${locationFilter.province}`;
    if (locationFilter.filterType === 'municipality') return `Municipality: ${locationFilter.municipality}`;
    if (locationFilter.filterType === 'barangay') return `Barangay: ${locationFilter.barangay}`;
    return 'All Locations';
};

export const loadAvailableLocations = async () => {
    const { data: profiles } = await supabase
        .from('profile')
        .select('region, province, municipality, barangay');

    if (profiles) {
        const regions = [...new Set(profiles.map(p => p.region).filter(Boolean))].sort();
        const provinces = [...new Set(profiles.map(p => p.province).filter(Boolean))].sort();
        const municipalities = [...new Set(profiles.map(p => p.municipality).filter(Boolean))].sort();
        const barangays = [...new Set(profiles.map(p => p.barangay).filter(Boolean))].sort();

        return { regions, provinces, municipalities, barangays };
    }

    return { regions: [], provinces: [], municipalities: [], barangays: [] };
};

// Add watermark function
const addWatermark = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.saveGraphicsState();
        
        // Set watermark properties
        doc.setGState(doc.GState({ opacity: 0.1 }));
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(50);
        
        // Calculate center position
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Add diagonal watermark
        doc.text(
            'CONFIDENTIAL',
            pageWidth / 2,
            pageHeight / 2,
            {
                angle: 45,
                align: 'center',
                baseline: 'middle'
            }
        );
        
        // Add footer watermark
        doc.setFontSize(20);
        doc.text(
            'Teenage Pregnancy Management Support System',
            pageWidth / 2,
            pageHeight - 20,
            {
                align: 'center',
                baseline: 'bottom'
            }
        );
        
        doc.restoreGraphicsState();
    }
};

// Add header function
const addHeader = (doc: jsPDF, title: string, locationText: string) => {
    doc.setFontSize(18);
    doc.setTextColor(0, 45, 84); // #002d54
    doc.text(title, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Location: ${locationText}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);
    doc.text(`Generated at: ${new Date().toLocaleTimeString()}`, 14, 44);
    
    // Add a line separator
    doc.setDrawColor(0, 45, 84);
    doc.setLineWidth(0.5);
    doc.line(14, 48, doc.internal.pageSize.getWidth() - 14, 48);
    
    doc.setTextColor(0, 0, 0); // Reset to black
};

export const fetchStatistics = async (locationFilter: LocationFilter) => {
    let profileQuery = supabase.from('profile').select('*', { count: 'exact', head: true });
    profileQuery = buildLocationQuery(profileQuery, locationFilter);
    const { count: profileCount } = await profileQuery;

    const { data: filteredProfiles } = await buildLocationQuery(
        supabase.from('profile').select('profileid'),
        locationFilter
    );
    const profileIds = filteredProfiles?.map((p: any) => p.profileid) || [];

    let healthCount = 0, educationCount = 0, caseCount = 0, pregnantCount = 0, enrolledCount = 0, childrenCount = 0;

    if (profileIds.length > 0) {
        const { count: hc } = await supabase
            .from('maternalhealthRecord')
            .select('*', { count: 'exact', head: true })
            .in('profileid', profileIds);
        healthCount = hc || 0;

        const { count: ec } = await supabase
            .from('EducationAndTraining')
            .select('*', { count: 'exact', head: true })
            .in('profileid', profileIds);
        educationCount = ec || 0;

        const { count: cc } = await supabase
            .from('caseManagement')
            .select('*', { count: 'exact', head: true })
            .in('profileid', profileIds);
        caseCount = cc || 0;

        const { count: pc } = await supabase
            .from('maternalhealthRecord')
            .select('*', { count: 'exact', head: true })
            .in('profileid', profileIds)
            .eq('pregnancy_status', 'Pregnant');
        pregnantCount = pc || 0;

        const { count: enc } = await supabase
            .from('EducationAndTraining')
            .select('*', { count: 'exact', head: true })
            .in('profileid', profileIds)
            .eq('status', 'Enrolled');
        enrolledCount = enc || 0;

        // Get children count
        const { count: chc } = await supabase
            .from('childRecord')
            .select('*', { count: 'exact', head: true })
            .in('healthid', profileIds);
        childrenCount = chc || 0;
    }

    return {
        totalProfiles: profileCount || 0,
        totalHealthRecords: healthCount || 0,
        totalEducationRecords: educationCount || 0,
        totalCases: caseCount || 0,
        pregnantCount: pregnantCount || 0,
        enrolledCount: enrolledCount || 0,
        totalChildren: childrenCount || 0,
    };
};

export const exportToPDF = (title: string, locationText: string, columns: string[], rows: any[][]) => {
    const doc = new jsPDF('landscape'); // Use landscape for better table viewing
    
    addHeader(doc, title, locationText);
    
    autoTable(doc, {
        startY: 55,
        head: [columns],
        body: rows,
        theme: 'striped',
        styles: { 
            fontSize: 8,
            cellPadding: 3,
        },
        headStyles: { 
            fillColor: [0, 45, 84], // #002d54
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        margin: { top: 60, left: 14, right: 14 },
    });
    
    addWatermark(doc);
    
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

export const generateSummaryReport = async (statistics: any, locationText: string) => {
    const doc = new jsPDF();
    
    addHeader(doc, 'TPMSS - Comprehensive Summary Report', locationText);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 45, 84);
    doc.text('Statistics Overview', 14, 65);
    
    const stats = [
        ['Total Teenage Mother Profiles', statistics.totalProfiles.toString()],
        ['Total Health Records', statistics.totalHealthRecords.toString()],
        ['Currently Pregnant', statistics.pregnantCount.toString()],
        ['Total Children Records', statistics.totalChildren.toString()],
        ['Total Education Records', statistics.totalEducationRecords.toString()],
        ['Currently Enrolled in Education', statistics.enrolledCount.toString()],
        ['Total Case Management Records', statistics.totalCases.toString()],
    ];
    
    autoTable(doc, {
        startY: 75,
        head: [['Metric', 'Count']],
        body: stats,
        theme: 'grid',
        headStyles: { 
            fillColor: [0, 45, 84],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 11,
            cellPadding: 5,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 120 },
            1: { halign: 'center', cellWidth: 60 }
        }
    });
    
    // Add summary insights
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.setTextColor(0, 45, 84);
    doc.text('Key Insights:', 14, finalY + 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const insights = [
        `• Average children per teenage mother: ${statistics.totalChildren > 0 && statistics.totalProfiles > 0 ? (statistics.totalChildren / statistics.totalProfiles).toFixed(2) : '0'}`,
        `• Pregnancy rate: ${statistics.totalProfiles > 0 ? ((statistics.pregnantCount / statistics.totalProfiles) * 100).toFixed(1) : '0'}%`,
        `• Education enrollment rate: ${statistics.totalProfiles > 0 ? ((statistics.enrolledCount / statistics.totalProfiles) * 100).toFixed(1) : '0'}%`,
        `• Case management coverage: ${statistics.totalProfiles > 0 ? ((statistics.totalCases / statistics.totalProfiles) * 100).toFixed(1) : '0'}%`,
    ];
    
    insights.forEach((insight, index) => {
        doc.text(insight, 14, finalY + 35 + (index * 8));
    });
    
    addWatermark(doc);
    
    doc.save(`TPMSS_Summary_Report_${locationText.replace(/[:\s]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

    export const generateProfilesReport = async (locationFilter: LocationFilter, locationText: string) => {
        let profileQuery = supabase.from('profile').select('*').order('createdAt', { ascending: false });
        profileQuery = buildLocationQuery(profileQuery, locationFilter);
        const { data: profiles, error: profileError } = await profileQuery;

        if (profileError) throw profileError;

        const columns = ['Name', 'Age', 'Civil Status', 'Address', 'Contact', 'Indigenous', 'Children Count'];
        const rows = await Promise.all(profiles.map(async (p) => {
            // Get children count for each profile
            const { data: healthRecords } = await supabase
                .from('maternalhealthRecord')
                .select('health_id')
                .eq('profileid', p.profileid);

            let childrenCount = 0;
            if (healthRecords && healthRecords.length > 0) {
                const healthIds = healthRecords.map(h => h.health_id);
                const { count } = await supabase
                    .from('childRecord')
                    .select('*', { count: 'exact', head: true })
                    .in('health_id', healthIds);
                childrenCount = count || 0;
            }

            return [
                `${p.firstName} ${p.middleName || ''} ${p.lastName}`.trim(),
                p.age?.toString() || 'N/A',
                p.marital_status || 'N/A',
                `${p.barangay || ''}, ${p.municipality || ''}, ${p.province || ''}, ${p.region || ''}`.trim(),
                p.contactnum || 'N/A',
                p.indigenous_ethnicity ? 'Yes' : 'No',
                childrenCount.toString(),
            ];
        }));

        const reportTitle = `TPMSS - Teenage Mother Profiles Report - ${locationText}`;
        exportToPDF(reportTitle, locationText, columns, rows);
    };

    export const generateHealthReport = async (locationFilter: LocationFilter, locationText: string) => {
        const { data: filteredProfiles } = await buildLocationQuery(
            supabase.from('profile').select('profileid'),
            locationFilter
        );
        const profileIds = filteredProfiles?.map((p: any) => p.profileid) || [];

        if (profileIds.length === 0) {
            throw new Error('No profiles found for selected location');
        }

        const { data: healthRecords, error: healthError } = await supabase
            .from('maternalhealthRecord')
            .select('*, profile(*)')
            .in('profileid', profileIds);

        if (healthError) throw healthError;

        const columns = ['Name', 'Status', 'Stage', 'Pregnancies', 'Medical History', 'Blood Pressure', 'Vaccinations'];
        const rows = healthRecords.map(h => {
            let vaccinations = 'None';
            if (h.vaccinations) {
                try {
                    const vaccinationData = JSON.parse(h.vaccinations);
                    if (Array.isArray(vaccinationData) && vaccinationData.length > 0) {
                        vaccinations = vaccinationData.map(v => `${v.vaccine_name} (${v.doses} doses)`).join(', ');
                    }
                } catch (e) {
                    vaccinations = 'Invalid data';
                }
            }

            return [
                h.profile ? `${h.profile.firstName} ${h.profile.lastName}` : 'N/A',
                h.pregnancy_status || 'N/A',
                h.stage_of_pregnancy || 'N/A',
                h.num_of_pregnancies?.toString() || 'N/A',
                h.medical_history || 'None',
                h.bloodPressure || 'N/A',
                vaccinations,
            ];
        });

        const reportTitle = `TPMSS - Maternal Health Records Report - ${locationText}`;
        exportToPDF(reportTitle, locationText, columns, rows);
    };

    export const generateChildrenReport = async (locationFilter: LocationFilter, locationText: string) => {
        const { data: filteredProfiles } = await buildLocationQuery(
            supabase.from('profile').select('profileid'),
            locationFilter
        );
        const profileIds = filteredProfiles?.map((p: any) => p.profileid) || [];

        if (profileIds.length === 0) {
            throw new Error('No profiles found for selected location');
        }

        // First get health record IDs for the filtered profiles
        const { data: healthRecords } = await supabase
            .from('maternalhealthRecord')
            .select('health_id, profileid')
            .in('profileid', profileIds);

        if (!healthRecords || healthRecords.length === 0) {
            throw new Error('No health records found for selected profiles');
        }

        const healthIds = healthRecords.map(h => h.health_id);

        // FIXED: Changed table name and added profile join through health records
        const { data: childrenRecords, error: childrenError } = await supabase
            .from('childRecord')
            .select('*, maternalhealthRecord!inner(profileid, profile(firstName, lastName))')
            .in('health_id', healthIds)
            .order('created_at', { ascending: false });

        if (childrenError) throw childrenError;

        const columns = ['Mother Name', 'Child Name', 'Birth Date', 'Birth Weight', 'Current Weight', 'Height', 'Health Status', 'Immunizations'];
        const rows = childrenRecords.map(c => {
            
            let immunizations = 'None';
            
            const immunizationFields = [
                c.BCG ? 'BCG' : null,
                c.heaptitis_b ? 'Hepatitis B' : null,
                c.pentavalent_vaccine ? 'Pentavalent' : null,
                c.oral_polio_vaccine ? 'Oral Polio' : null,
                c['inactive-polio'] ? 'Inactive Polio' : null,
                c.onuemoccal_conjucate ? 'Pneumococcal' : null,
                c.Measssles_rubella ? 'Measles-Rubella' : null
            ].filter(Boolean);
            
            if (immunizationFields.length > 0) {
                immunizations = immunizationFields.join(', ');
            }

            return [
                c.maternalhealthRecord?.profile ? 
                    `${c.maternalhealthRecord.profile.firstName} ${c.maternalhealthRecord.profile.lastName}` : 'N/A',
                c.childName || 'N/A',
                c.child_birthdate ? new Date(c.child_birthdate).toLocaleDateString() : 'N/A', 
                c.birth_weight ? `${c.birth_weight} kg` : 'N/A',
                c.weight ? `${c.weight} kg` : 'N/A',
                c.height ? `${c.height} cm` : 'N/A',
                c.status || 'N/A', 
                immunizations,
            ];
        });

        const reportTitle = `TPMSS - Children Health Records Report - ${locationText}`;
        exportToPDF(reportTitle, locationText, columns, rows);
    };

export const generateEducationReport = async (locationFilter: LocationFilter, locationText: string) => {
    const { data: eduFilteredProfiles } = await buildLocationQuery(
        supabase.from('profile').select('profileid'),
        locationFilter
    );
    const eduProfileIds = eduFilteredProfiles?.map((p: any) => p.profileid) || [];

    if (eduProfileIds.length === 0) {
        throw new Error('No profiles found for selected location');
    }

    const { data: eduRecords, error: eduError } = await supabase
        .from('EducationAndTraining')
        .select('*, profile(*)')
        .in('profileid', eduProfileIds)
        .order('created_at', { ascending: false });

    if (eduError) throw eduError;

    const columns = ['Name', 'School/Program', 'Course/Program', 'Status', 'Institution', 'Grade Level', 'Date Enrolled/Dropped'];
    const rows = eduRecords.map(e => [
        e.profile ? `${e.profile.firstName} ${e.profile.lastName}` : 'N/A',
        e.typeOfProgram || 'N/A',
        e.programCourse || 'N/A',
        e.status || 'N/A',
        e.institutionOrCenter || 'N/A',
        e.gradeLevel || 'N/A',
        e.enroll_dropout_Date ? new Date(e.enroll_dropout_Date).toLocaleDateString() : 'N/A',
    ]);

    const reportTitle = `TPMSS - Education and Training Report - ${locationText}`;
    exportToPDF(reportTitle, locationText, columns, rows);
};

export const generateCasesReport = async (locationFilter: LocationFilter, locationText: string) => {
    const { data: caseFilteredProfiles } = await buildLocationQuery(
        supabase.from('profile').select('profileid'),
        locationFilter
    );
    const caseProfileIds = caseFilteredProfiles?.map((p: any) => p.profileid) || [];

    if (caseProfileIds.length === 0) {
        throw new Error('No profiles found for selected location');
    }

    const { data: cases, error: caseError } = await supabase
        .from('caseManagement')
        .select('*, profile(*)')
        .in('profileid', caseProfileIds)
        .order('created_at', { ascending: false });

    if (caseError) throw caseError;

    const columns = [
        'Name', 
        'Guidance Counseling', 
        'GC Type', 
        'GC From', 
        'Family Support', 
        'FS Type', 
        'Social Support',
        'SS Type',
        'Partner Support',
        'PS Type',
        'Date Created'
    ];
    
    const rows = cases.map(c => [
        c.profile ? `${c.profile.firstName} ${c.profile.lastName}` : 'N/A',
        c.received_GC || 'N/A',
        c.guidance_type || 'N/A',
        c.guid_received_from || 'N/A',
        c.received_FS || 'N/A',
        c.family_support_type || 'N/A',
        c.received_SS || 'N/A',
        c.social_support_type || 'N/A',
        c.received_PS || 'N/A',
        c.partner_support_type || 'N/A',
        c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A',
    ]);

    const reportTitle = `TPMSS - Case Management Report - ${locationText}`;
    exportToPDF(reportTitle, locationText, columns, rows);
};

export const generatePrenatalPostnatalReport = async (locationFilter: LocationFilter, locationText: string) => {
    const { data: filteredProfiles } = await buildLocationQuery(
        supabase.from('profile').select('profileid'),
        locationFilter
    );
    const profileIds = filteredProfiles?.map((p: any) => p.profileid) || [];

    if (profileIds.length === 0) {
        throw new Error('No profiles found for selected location');
    }

    // Get health record IDs for the filtered profiles
    const { data: healthRecords } = await supabase
        .from('maternalhealthRecord')
        .select('health_id, profileid')
        .in('profileid', profileIds);

    if (!healthRecords || healthRecords.length === 0) {
        throw new Error('No health records found for selected profiles');
    }

    const healthIds = healthRecords.map(h => h.health_id);

    const { data: visitRecords, error: visitError } = await supabase
        .from('PrenatalPostnatalVisit')
        .select('*, maternalhealthRecord!inner(profileid, profile(firstName, lastName))')
        .in('health_id', healthIds)
        .order('created_at', { ascending: false });

    if (visitError) throw visitError;

    const columns = [
        'Mother Name',
        'Visit Type',
        'Visit Number',
        'Visit Date',
        'Week of Pregnancy',
        'Next Schedule',
        'Compliance',
        'Visit Created'
    ];

    const rows = visitRecords.map(v => {
        const visitType = v.prenatal_visit_num > 0 ? 'Prenatal' : 'Postnatal';
        const visitNumber = v.prenatal_visit_num > 0 ? v.prenatal_visit_num : v.postnatal_visit_num;
        const visitDate = v.prenatal_visit_date || v.postnatal_visit_date;
        const nextSchedule = v.prenatal_next_sched || v.postnatal_next_sched;

        return [
            v.maternalhealthRecord?.profile ? 
                `${v.maternalhealthRecord.profile.firstName} ${v.maternalhealthRecord.profile.lastName}` : 'N/A',
            visitType,
            visitNumber?.toString() || 'N/A',
            visitDate ? new Date(visitDate).toLocaleDateString() : 'N/A',
            v.week_of_pregnancy || 'N/A',
            nextSchedule ? new Date(nextSchedule).toLocaleDateString() : 'N/A',
            v.care_compliance || 'N/A',
            v.created_at ? new Date(v.created_at).toLocaleDateString() : 'N/A',
        ];
    });

    const reportTitle = `TPMSS - Prenatal/Postnatal Visits Report - ${locationText}`;
    exportToPDF(reportTitle, locationText, columns, rows);
};

export const generateLocationBreakdownReport = async (locationFilter: LocationFilter) => {
    let groupByField = '';
    let reportTitle = '';
    let filterQuery: any = {};

    if (locationFilter.filterType === 'region' && locationFilter.region) {
        groupByField = 'province';
        reportTitle = `TPMSS - Province Breakdown for ${locationFilter.region}`;
        filterQuery = { region: locationFilter.region };
    } else if (locationFilter.filterType === 'province' && locationFilter.province) {
        groupByField = 'municipality';
        reportTitle = `TPMSS - Municipality Breakdown for ${locationFilter.province}`;
        filterQuery = { province: locationFilter.province };
    } else if (locationFilter.filterType === 'municipality' && locationFilter.municipality) {
        groupByField = 'barangay';
        reportTitle = `TPMSS - Barangay Breakdown for ${locationFilter.municipality}`;
        filterQuery = { municipality: locationFilter.municipality };
    } else {
        throw new Error('Please select a Region, Province, or Municipality to generate breakdown report');
    }

    let query = supabase.from('profile').select('*');
    Object.entries(filterQuery).forEach(([key, value]) => {
        query = query.eq(key, value);
    });
    const { data: profiles, error: profileError } = await query;

    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) {
        throw new Error('No data found for the selected location');
    }

    const groupedData: { [key: string]: any[] } = {};
    profiles.forEach(profile => {
        const key = profile[groupByField] || 'Unknown';
        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(profile);
    });

    const breakdownStats: any[] = [];
    
    for (const [locationName, locationProfiles] of Object.entries(groupedData)) {
        const profileIds = locationProfiles.map(p => p.profileid);
        
        const ages = locationProfiles.map(p => p.age).filter(age => age > 0);
        const averageAge = ages.length > 0 
            ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1)
            : 'N/A';

        const { data: eduRecords } = await supabase
            .from('EducationAndTraining')
            .select('status')
            .in('profileid', profileIds);

        const { data: healthRecords } = await supabase
            .from('maternalhealthRecord')
            .select('health_id')
            .in('profileid', profileIds)

        let childrenCount = 0;
        if (healthRecords && healthRecords.length > 0) {
            const healthIds = healthRecords.map(h => h.health_id);
            const { count } = await supabase
                .from('childRecord')
                .select('*', { count: 'exact', head: true })
                .in('health_id', healthIds);
            childrenCount = count || 0;
        }

        const enrolledCount = eduRecords?.filter(e => e.status === 'Enrolled').length || 0;
        const dropoutCount = eduRecords?.filter(e => e.status === 'Dropout').length || 0;

        breakdownStats.push({
            location: locationName,
            count: locationProfiles.length,
            averageAge,
            enrolled: enrolledCount,
            dropout: dropoutCount,
            children: childrenCount || 0,
        });
    }

    breakdownStats.sort((a, b) => a.location.localeCompare(b.location));

    const doc = new jsPDF();
    addHeader(doc, reportTitle, getLocationFilterText(locationFilter));

    const columns = ['Location', 'Teenage Mothers', 'Average Age', 'Enrolled', 'Dropout', 'Total Children'];
    const rows = breakdownStats.map(stat => [
        stat.location,
        stat.count.toString(),
        stat.averageAge,
        stat.enrolled.toString(),
        stat.dropout.toString(),
        stat.children.toString(),
    ]);

    const totalCount = breakdownStats.reduce((sum, s) => sum + s.count, 0);
    const totalEnrolled = breakdownStats.reduce((sum, s) => sum + s.enrolled, 0);
    const totalDropout = breakdownStats.reduce((sum, s) => sum + s.dropout, 0);
    const totalChildren = breakdownStats.reduce((sum, s) => sum + s.children, 0);
    const allAges = profiles.map(p => p.age).filter(age => age > 0);
    const overallAverage = allAges.length > 0 
        ? (allAges.reduce((sum, age) => sum + age, 0) / allAges.length).toFixed(1)
        : 'N/A';

    rows.push(['TOTAL', totalCount.toString(), overallAverage, totalEnrolled.toString(), totalDropout.toString(), totalChildren.toString()]);

    autoTable(doc, {
        startY: 55,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { 
            fillColor: [0, 45, 84],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        footStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' },
        didParseCell: (data) => {
            if (data.row.index === rows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [230, 230, 230];
            }
        },
    });

    addWatermark(doc);

    doc.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};