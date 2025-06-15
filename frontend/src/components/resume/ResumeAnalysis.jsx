import React from 'react';
import PropTypes from 'prop-types';
import { 
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box, 
  Chip, 
  CircularProgress, 
  Divider,
  Grid,
  LinearProgress,
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Paper, 
  Typography, 
} from '@mui/material';
import { 
  Check as CheckIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ConstructionOutlined as ConstructionOutlinedIcon,
  Error as ErrorIcon,
  ErrorOutline as ErrorOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  LightbulbOutlined as LightbulbOutlinedIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  Star as StarIcon,
  VpnKeyOutlined as VpnKeyOutlinedIcon,
  Warning as WarningIcon,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';

const ScoreMeter = ({ score, max = 100 }) => {
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));
  const color = score > 75 ? 'success' : score > 50 ? 'primary' : 'error';
  
  return (
    <Box sx={{ width: '100%', position: 'relative', mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Score: {score}/100
        </Typography>
        <Typography variant="caption" color={`${color}.main`}>
          {score > 75 ? 'Excellent' : score > 50 ? 'Good' : 'Needs Improvement'}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

const SectionAnalysis = ({ section }) => {
  return (
    <Accordion defaultExpanded sx={{ mb: 1, '&:before': { display: 'none' }, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, boxShadow: 'none' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${section.section}-content`}
        id={`panel-${section.section}-header`}
      >
        <Typography sx={{ flexBasis: '40%', flexShrink: 0, fontWeight: 'bold' }}>{section.section}</Typography>
        <Chip 
          label={`${section.score}%`} 
          size="small"
          color={section.score > 70 ? 'success' : section.score > 40 ? 'warning' : 'error'}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {section.feedback}
        </Typography>
        {section.suggestions && section.suggestions.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <LightbulbOutlinedIcon color="primary" sx={{ mr: 1 }} />
              Suggestions
            </Typography>
            <List dense disablePadding>
              {section.suggestions.map((suggestion, idx) => (
                <ListItem key={idx} disableGutters disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <StarIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={suggestion} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const ResumeAnalysis = ({ analysis: analysisResult, loading, error }) => {
  console.log('Raw analysis result:', analysisResult);
  // Handle case where analysis might be nested in a data property
  const analysis = analysisResult?.data || analysisResult;
  console.log('Processed analysis data:', analysis);
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading analysis: {error}
      </Alert>
    );
  }

  if (!analysis) return null;

  // Ensure we have a valid score
  const score = analysis.score || 0;
  
  // Destructure with default values to prevent errors
  const {
    overview = '',
    strengths = [],
    improvement_areas = [],
    missing_keywords = [],
    missing_skills = [],
    section_analysis = [],
    targeted_improvements = { critical: [], recommended: [], optional: [] },
    general_feedback = ''
  } = analysis;

  return (
    <Box sx={{ p: 2 }}>
      {/* Overall Score & Overview */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Resume Analysis
            </Typography>
            <Typography variant="body1" paragraph>
              {overview || 'No overview provided.'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" color="primary" sx={{ fontWeight: 'bold' }}>
                {typeof score === 'number' ? score : 'N/A'}%
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Match Score
              </Typography>
              <ScoreMeter score={score || 0} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Strengths and Improvement Areas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#e8f5e9', height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlineIcon sx={{ mr: 1 }} /> Strengths
              </Typography>
              <List dense>
                {strengths?.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                     <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: '#2e7d32' }}><CheckIcon /></ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#fff3e0', height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#e65100', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <ReportProblemOutlinedIcon sx={{ mr: 1 }} /> Areas for Improvement
              </Typography>
              <List dense>
                {improvement_areas?.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: '#e65100' }}><WarningAmberIcon /></ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Paper>
        </Grid>
      </Grid>

      {/* Missing Keywords & Skills */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <VpnKeyOutlinedIcon color="warning" sx={{ mr: 1 }} />
              Missing Keywords
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {missing_keywords && missing_keywords.length > 0 ? (
                missing_keywords.map((keyword, idx) => (
                  <Chip key={idx} label={keyword} color="warning" variant="outlined" size="small" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No missing keywords found.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ConstructionOutlinedIcon color="error" sx={{ mr: 1 }} />
              Missing Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {missing_skills && missing_skills.length > 0 ? (
                missing_skills.map((skill, idx) => (
                  <Chip key={idx} label={skill} color="error" variant="outlined" size="small" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No missing skills found.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Section Analysis */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Detailed Analysis
      </Typography>
      {section_analysis?.map((section, idx) => (
        <SectionAnalysis key={idx} section={section} />
      ))}

      {/* Targeted Improvements */}
      {targeted_improvements && (
        <Paper elevation={0} sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>Targeted Improvements</Typography>
          {targeted_improvements.critical && targeted_improvements.critical.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="error" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorOutlineIcon color="error" sx={{ mr: 1 }} /> Critical
              </Typography>
              <List dense>
                {targeted_improvements.critical.map((item, idx) => (
                  <ListItem key={idx} disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}><ErrorIcon color="error" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {targeted_improvements.recommended && targeted_improvements.recommended.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} /> Recommended
              </Typography>
              <List dense>
                {targeted_improvements.recommended.map((item, idx) => (
                  <ListItem key={idx} disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {targeted_improvements.optional && targeted_improvements.optional.length > 0 && (
            <Box>
              <Typography variant="subtitle1" color="info.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon color="info" sx={{ mr: 1 }} /> Optional
              </Typography>
              <List dense>
                {targeted_improvements.optional.map((item, idx) => (
                  <ListItem key={idx} disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}><InfoIcon color="info" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      {/* General Feedback */}
      {general_feedback && (
        <Paper elevation={0} sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>General Feedback</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {general_feedback}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

ResumeAnalysis.propTypes = {
  analysis: PropTypes.shape({
    score: PropTypes.number,
    overview: PropTypes.string,
    strengths: PropTypes.arrayOf(PropTypes.string),
    improvement_areas: PropTypes.arrayOf(PropTypes.string),
    missing_keywords: PropTypes.arrayOf(PropTypes.string),
    missing_skills: PropTypes.arrayOf(PropTypes.string),
    section_analysis: PropTypes.arrayOf(PropTypes.object),
    targeted_improvements: PropTypes.shape({
      critical: PropTypes.arrayOf(PropTypes.string),
      recommended: PropTypes.arrayOf(PropTypes.string),
      optional: PropTypes.arrayOf(PropTypes.string)
    }),
    general_feedback: PropTypes.string
  }),
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default ResumeAnalysis;
