/* eslint-disable complexity */
// This file is part of Pa11y Dashboard.
//
// Pa11y Dashboard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Pa11y Dashboard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Pa11y Dashboard.  If not, see <http://www.gnu.org/licenses/>.
'use strict';

const getStandards = require('../data/standards');
const httpHeaders = require('http-headers');
const logger = require('../enhanced-logging');

module.exports = function route(app) {
	app.express.get('/new', (request, response) => {
		const standards = getStandards().map(
			standard => {
				if (standard.title === 'WCAG2AA') {
					standard.selected = true;
				}
				return standard;
			});
		response.render('new', {
			standards,
			isNewTaskPage: true
		});
	});

	app.express.post('/new', (request, response) => {
		logger.info('Creating new task', {
			requestId: request.id,
			taskName: request.body.name,
			taskUrl: request.body.url,
			standard: request.body.standard
		});

		const parsedActions = parseActions(request.body.actions);
		const parsedHeaders = request.body.headers && httpHeaders(request.body.headers, true);

		const newTask = createNewTask(request, parsedActions, parsedHeaders);

		logger.info('Task data prepared', {
			requestId: request.id,
			taskData: {
				name: newTask.name,
				url: newTask.url,
				standard: newTask.standard,
				timeout: newTask.timeout,
				hasActions: !!newTask.actions && newTask.actions.length > 0,
				hasHeaders: !!newTask.headers
			}
		});

		app.webservice.tasks.create(newTask, (error, task) => {
			if (!error) {
				logger.objectId('CREATED', task.id, {
					requestId: request.id,
					taskName: task.name,
					taskUrl: task.url,
					standard: task.standard
				});
				
				logger.info('Task created successfully', {
					requestId: request.id,
					objectId: task.id,
					taskName: task.name
				});
				
				return response.redirect(`/${task.id}?added`);
			}

			logger.error('Failed to create task', error, {
				requestId: request.id,
				taskName: newTask.name,
				taskUrl: newTask.url
			});

			const standards = getStandards().map(standard => {
				if (standard.title === newTask.standard) {
					standard.selected = true;
				}
				standard.rules = standard.rules.map(rule => {
					if (newTask.ignore.indexOf(rule.name) !== -1) {
						rule.ignored = true;
					}
					return rule;
				});
				return standard;
			});
			newTask.actions = request.body.actions;
			newTask.headers = request.body.headers;
			response.render('new', {
				error,
				standards,
				task: newTask
			});
		});
	});
};

function parseActions(actions) {
	if (actions) {
		return actions.split(/[\r\n]+/)
			.map(action => {
				return action.trim();
			})
			.filter(action => {
				return Boolean(action);
			});
	}
}


function createNewTask({body}, actions, headers) {
	return {
		name: body.name,
		url: body.url,
		standard: body.standard,
		ignore: body.ignore || [],
		timeout: body.timeout || undefined,
		wait: body.wait || undefined,
		actions,
		username: body.username || undefined,
		password: body.password || undefined,
		headers,
		hideElements: body.hideElements || undefined
	};
}
