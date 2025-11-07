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

export const fetchStatistics = async (locationFilter: LocationFilter) => {
    let profileQuery = supabase.from('profile').select('*', { count: 'exact', head: true });
    profileQuery = buildLocationQuery(profileQuery, locationFilter);
    const { count: profileCount } = await profileQuery;

    const { data: filteredProfiles } = await buildLocationQuery(
        supabase.from('profile').select('profileid'),
        locationFilter
    );
    const profileIds = filteredProfiles?.map((p: any) => p.profileid) || [];

    let healthCount = 0, educationCount = 0, caseCount = 0, pregnantCount = 0, enrolledCount = 0;

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
    }

    return {
        totalProfiles: profileCount || 0,
        totalHealthRecords: healthCount || 0,
        totalEducationRecords: educationCount || 0,
        totalCases: caseCount || 0,
        pregnantCount: pregnantCount || 0,
        enrolledCount: enrolledCount || 0,
    };
};

export const exportToPDF = (title: string, locationText: string, columns: string[], rows: any[][]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    autoTable(doc, {
        startY: 35,
        head: [columns],
        body: rows,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
    });
    
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

export const generateSummaryReport = async (statistics: any, locationText: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Summary Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Location: ${locationText}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);
    
    doc.setFontSize(14);
    doc.text('Statistics Overview', 14, 50);
    
    const stats = [
        ['Total Profiles', statistics.totalProfiles.toString()],
        ['Total Health Records', statistics.totalHealthRecords.toString()],
        ['Currently Pregnant', statistics.pregnantCount.toString()],
        ['Total Education Records', statistics.totalEducationRecords.toString()],
        ['Currently Enrolled', statistics.enrolledCount.toString()],
        ['Total Case Management Records', statistics.totalCases.toString()],
    ];
    
    autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Count']],
        body: stats,
        theme: 'grid',
    });
    
    doc.save(`Summary_Report_${locationText.replace(/[:\s]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateProfilesReport = async (locationFilter: LocationFilter, locationText: string) => {
    let profileQuery = supabase.from('profile').select('*').order('createdAt', { ascending: false });
    profileQuery = buildLocationQuery(profileQuery, locationFilter);
    const { data: profiles, error: profileError } = await profileQuery;

    if (profileError) throw profileError;

    const columns = ['Name', 'Age', 'Civil Status', 'Address', 'Contact', 'Indigenous'];
    const rows = profiles.map(p => [
        `${p.firstName} ${p.middleName || ''} ${p.lastName}`.trim(),
        p.age?.toString() || 'N/A',
        p.marital_status || 'N/A',
        `${p.barangay || ''}, ${p.municipality || ''}, ${p.province || ''}, ${p.region || ''}`.trim(),
        p.contactnum || 'N/A',
        p.indigenous_ethnicity ? 'Yes' : 'No',
    ]);

    const reportTitle = `Teenage Mother Profiles Report - ${locationText}`;
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

    const columns = ['Name', 'Status', 'Stage', 'Pregnancies', 'Medical History', 'Support'];
    const rows = healthRecords.map(h => [
        h.profile ? `${h.profile.firstName} ${h.profile.lastName}` : 'N/A',
        h.pregnancy_status || 'N/A',
        h.stage_of_pregnancy || 'N/A',
        h.num_of_pregnancies?.toString() || 'N/A',
        h.medical_history || 'None',
    ]);

    const reportTitle = `Maternal Health Records Report - ${locationText}`;
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

    const columns = ['Name', 'School/Program', 'Course/Program', 'Status', 'Name of Institution', 'Grade Level', 'Date Enrolled'];
    const rows = eduRecords.map(e => [
        e.profile ? `${e.profile.firstName} ${e.profile.lastName}` : 'N/A',
        e.typeOfProgram || 'N/A',
        e.programCourse || 'N/A',
        e.status || 'N/A',
        e.institutionOrCenter || 'N/A',
        e.gradeLevel || 'N/A',
        e.enroll_dropout_Date ? new Date(e.enroll_dropout_Date).toLocaleDateString() : 'N/A',
    ]);

    const reportTitle = `Education and Training Report - ${locationText}`;
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

    const columns = ['Name', 'Received Counseling', 'Type', 'From', 'Frequency', 'Family Support', 'Type', 'From', 'Frequency', 'Date'];
    const rows = cases.map(c => [
        c.profile ? `${c.profile.firstName} ${c.profile.lastName}` : 'N/A',
        c.received_GC || 'N/A',
        c.guidance_type || 'N/A',
        c.guid_received_from || 'N/A',
        c.guidance_frequency || 'N/A',
        c.received_FS || 'N/A',
        c.family_support_type || 'N/A',
        c.fam_sup_received_from || 'N/A',
        c.family_support_frequency || 'N/A',
        c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A',
    ]);

    const reportTitle = `Case Management Report - ${locationText}`;
    exportToPDF(reportTitle, locationText, columns, rows);
};

export const generateLocationBreakdownReport = async (locationFilter: LocationFilter) => {
    let groupByField = '';
    let reportTitle = '';
    let filterQuery: any = {};

    if (locationFilter.filterType === 'region' && locationFilter.region) {
        groupByField = 'province';
        reportTitle = `Province Breakdown for ${locationFilter.region}`;
        filterQuery = { region: locationFilter.region };
    } else if (locationFilter.filterType === 'province' && locationFilter.province) {
        groupByField = 'municipality';
        reportTitle = `Municipality Breakdown for ${locationFilter.province}`;
        filterQuery = { province: locationFilter.province };
    } else if (locationFilter.filterType === 'municipality' && locationFilter.municipality) {
        groupByField = 'barangay';
        reportTitle = `Barangay Breakdown for ${locationFilter.municipality}`;
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

        const enrolledCount = eduRecords?.filter(e => e.status === 'Enrolled').length || 0;
        const dropoutCount = eduRecords?.filter(e => e.status === 'Dropout').length || 0;

        breakdownStats.push({
            location: locationName,
            count: locationProfiles.length,
            averageAge,
            enrolled: enrolledCount,
            dropout: dropoutCount,
        });
    }

    breakdownStats.sort((a, b) => a.location.localeCompare(b.location));

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(reportTitle, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const columns = ['Location', 'Total Count', 'Average Age', 'Enrolled', 'Dropout'];
    const rows = breakdownStats.map(stat => [
        stat.location,
        stat.count.toString(),
        stat.averageAge,
        stat.enrolled.toString(),
        stat.dropout.toString(),
    ]);

    const totalCount = breakdownStats.reduce((sum, s) => sum + s.count, 0);
    const totalEnrolled = breakdownStats.reduce((sum, s) => sum + s.enrolled, 0);
    const totalDropout = breakdownStats.reduce((sum, s) => sum + s.dropout, 0);
    const allAges = profiles.map(p => p.age).filter(age => age > 0);
    const overallAverage = allAges.length > 0 
        ? (allAges.reduce((sum, age) => sum + age, 0) / allAges.length).toFixed(1)
        : 'N/A';

    rows.push(['TOTAL', totalCount.toString(), overallAverage, totalEnrolled.toString(), totalDropout.toString()]);

    autoTable(doc, {
        startY: 40,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        footStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' },
        didParseCell: (data) => {
            if (data.row.index === rows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [230, 230, 230];
            }
        },
    });

    doc.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};