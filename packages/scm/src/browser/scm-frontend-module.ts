/********************************************************************************
 * Copyright (C) 2019 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import '../../src/browser/style/index.css';

import { ContainerModule } from 'inversify';
import {
    bindViewContribution, FrontendApplicationContribution,
    WidgetFactory, ViewContainer,
    WidgetManager, ApplicationShellLayoutMigration
} from '@theia/core/lib/browser';
import { ScmService } from './scm-service';
import { SCM_WIDGET_FACTORY_ID, ScmContribution, SCM_VIEW_CONTAINER_ID, SCM_VIEW_CONTAINER_TITLE_OPTIONS } from './scm-contribution';
import { ScmWidget } from './scm-widget';
import { ScmQuickOpenService } from './scm-quick-open-service';
import { bindDirtyDiff } from './dirty-diff/dirty-diff-module';
import { NavigatorTreeDecorator } from '@theia/navigator/lib/browser';
import { ScmNavigatorDecorator } from './decorations/scm-navigator-decorator';
import { ScmDecorationsService } from './decorations/scm-decorations-service';
import { ScmAvatarService } from './scm-avatar-service';
import { ScmContextKeyService } from './scm-context-key-service';
import { ScmLayoutVersion3Migration } from './scm-layout-migrations';
import { ColorContribution } from '@theia/core/lib/browser/color-application-contribution';

export default new ContainerModule(bind => {
    bind(ScmContextKeyService).toSelf().inSingletonScope();
    bind(ScmService).toSelf().inSingletonScope();

    bind(ScmWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: SCM_WIDGET_FACTORY_ID,
        createWidget: () => container.get(ScmWidget)
    })).inSingletonScope();
    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: SCM_VIEW_CONTAINER_ID,
        createWidget: async () => {
            const viewContainer = container.get<ViewContainer.Factory>(ViewContainer.Factory)({
                id: SCM_VIEW_CONTAINER_ID,
                progressLocationId: 'scm'
            });
            viewContainer.setTitleOptions(SCM_VIEW_CONTAINER_TITLE_OPTIONS);
            const widget = await container.get(WidgetManager).getOrCreateWidget(SCM_WIDGET_FACTORY_ID);
            viewContainer.addWidget(widget, {
                canHide: false,
                initiallyCollapsed: false
            });
            return viewContainer;
        }
    })).inSingletonScope();
    bind(ApplicationShellLayoutMigration).to(ScmLayoutVersion3Migration).inSingletonScope();

    bind(ScmQuickOpenService).toSelf().inSingletonScope();
    bindViewContribution(bind, ScmContribution);
    bind(FrontendApplicationContribution).toService(ScmContribution);
    bind(ColorContribution).toService(ScmContribution);

    bind(NavigatorTreeDecorator).to(ScmNavigatorDecorator).inSingletonScope();
    bind(ScmDecorationsService).toSelf().inSingletonScope();

    bind(ScmAvatarService).toSelf().inSingletonScope();

    bindDirtyDiff(bind);
});
