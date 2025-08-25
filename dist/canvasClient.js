import axios from 'axios';
import { DataAnonymizer } from './anonymizer.js';
export class CanvasClient {
    axios;
    constructor(baseUrl, apiToken) {
        this.axios = axios.create({
            baseURL: baseUrl,
            headers: { Authorization: `Bearer ${apiToken}` }
        });
    }
    // Generic GET with error handling
    async get(url, params = {}) {
        try {
            const response = await this.axios.get(url, { params });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // Generic POST with error handling
    async post(url, data = {}, params = {}) {
        try {
            const response = await this.axios.post(url, data, { params });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // Generic PUT with error handling
    async put(url, data = {}, params = {}) {
        try {
            const response = await this.axios.put(url, data, { params });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // Generic DELETE with error handling
    async delete(url, params = {}) {
        try {
            const response = await this.axios.delete(url, { params });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // Fetch all pages for paginated endpoints
    async fetchAllPages(url, params = {}) {
        let results = [];
        let page = 1;
        let hasMore = true;
        const per_page = params.per_page || 100;
        while (hasMore) {
            const pageParams = { ...params, page, per_page };
            const data = await this.get(url, pageParams);
            results.push(...data);
            hasMore = data.length === per_page;
            page += 1;
        }
        return results;
    }
    // Centralized error handler
    handleError(error) {
        if (error.response?.data?.errors) {
            throw new Error(JSON.stringify(error.response.data.errors));
        }
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Unknown error occurred in CanvasClient');
    }
    // --- Courses ---
    async listCourses(params = {}) {
        return this.get('/api/v1/courses', params);
    }
    async postAnnouncement(courseId, data) {
        return this.post(`/api/v1/courses/${courseId}/discussion_topics`, data);
    }
    // --- Assignments ---
    async listCourseAssignments(courseId, params = {}, options = {}) {
        const data = await this.get(`/api/v1/courses/${courseId}/assignments`, params);
        return options.anonymous !== false ? DataAnonymizer.anonymizeAssignments(data) : data;
    }
    async getAssignment(courseId, assignmentId) {
        return this.get(`/api/v1/courses/${courseId}/assignments/${assignmentId}`);
    }
    async createAssignment(courseId, data) {
        return this.post(`/api/v1/courses/${courseId}/assignments`, data);
    }
    async updateAssignment(courseId, assignmentId, data) {
        return this.put(`/api/v1/courses/${courseId}/assignments/${assignmentId}`, data);
    }
    // --- Assignment Groups ---
    async listAssignmentGroups(courseId) {
        return this.get(`/api/v1/courses/${courseId}/assignment_groups`);
    }
    async createAssignmentGroup(courseId, data) {
        return this.post(`/api/v1/courses/${courseId}/assignment_groups`, data);
    }
    // --- Modules ---
    async listModules(courseId, params = {}) {
        return this.get(`/api/v1/courses/${courseId}/modules`, params);
    }
    async listModuleItems(courseId, moduleId, params = {}) {
        return this.get(`/api/v1/courses/${courseId}/modules/${moduleId}/items`, params);
    }
    async getModule(courseId, moduleId) {
        return this.get(`/api/v1/courses/${courseId}/modules/${moduleId}`);
    }
    async updateModulePublish(courseId, moduleId, data) {
        return this.put(`/api/v1/courses/${courseId}/modules/${moduleId}`, data);
    }
    // --- Pages ---
    async listPages(courseId, params = {}) {
        return this.get(`/api/v1/courses/${courseId}/pages`, params);
    }
    async getPage(courseId, pageUrl) {
        return this.get(`/api/v1/courses/${courseId}/pages/${encodeURIComponent(pageUrl)}`);
    }
    async listPageRevisions(courseId, pageUrl) {
        return this.get(`/api/v1/courses/${courseId}/pages/${encodeURIComponent(pageUrl)}/revisions`);
    }
    async revertPageRevision(courseId, pageUrl, revisionId) {
        return this.post(`/api/v1/courses/${courseId}/pages/${encodeURIComponent(pageUrl)}/revisions/${revisionId}/revert`);
    }
    async updateOrCreatePage(courseId, pageUrl, data) {
        return this.put(`/api/v1/courses/${courseId}/pages/${encodeURIComponent(pageUrl)}`, data);
    }
    // --- Rubrics ---
    async listRubrics(courseId) {
        return this.get(`/api/v1/courses/${courseId}/rubrics`);
    }
    async getRubricStatistics(courseId, assignmentId, params = {}) {
        return this.get(`/api/v1/courses/${courseId}/assignments/${assignmentId}`, params);
    }
    async listRubricAssessments(courseId, assignmentId, params = {}, options = {}) {
        const data = await this.get(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`, params);
        return options.anonymous !== false ? DataAnonymizer.anonymizeSubmissions(data) : data;
    }
    async attachRubricToAssignment(courseId, assignmentId, rubricId) {
        return this.put(`/api/v1/courses/${courseId}/assignments/${assignmentId}?rubric_id=${encodeURIComponent(rubricId)}`);
    }
    // --- Students ---
    async listStudents(courseId, params = {}, options = {}) {
        const data = await this.get(`/api/v1/courses/${courseId}/users`, params);
        return options.anonymous !== false ? DataAnonymizer.anonymizeUsers(data) : data;
    }
    // --- Sections ---
    async listSections(courseId, params = {}) {
        return this.get(`/api/v1/courses/${courseId}/sections`, params);
    }
    async getSection(courseId, sectionId) {
        return this.get(`/api/v1/courses/${courseId}/sections/${sectionId}`);
    }
    async listSectionAssignmentSubmissions(sectionId, assignmentId, params = {}, options = {}) {
        const data = await this.get(`/api/v1/sections/${sectionId}/assignments/${assignmentId}/submissions`, params);
        return options.anonymous !== false ? DataAnonymizer.anonymizeSubmissions(data) : data;
    }
    // --- Submissions ---
    async listAssignmentSubmissions(courseId, assignmentId, params = {}, options = {}) {
        const data = await this.get(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`, params);
        return options.anonymous !== false ? DataAnonymizer.anonymizeSubmissions(data) : data;
    }
    async gradeSubmission(courseId, assignmentId, userId, data) {
        return this.put(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`, data);
    }
}
