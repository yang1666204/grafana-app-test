// export const getFieldLinksForExplore = (options: {
//   field: Field;
//   rowIndex: number;
//   splitOpenFn?: SplitOpen;
//   range: TimeRange;
//   vars?: ScopedVars;
//   dataFrame?: DataFrame;
//   // if not provided, field.config.links are used
//   linksToProcess?: DataLink[];
// }): ExploreFieldLinkModel[] => {
//   const { field, vars, splitOpenFn, range, rowIndex, dataFrame } = options;
//   const scopedVars: ScopedVars = { ...(vars || {}) };
//   scopedVars['__value'] = {
//     value: {
//       raw: field.values[rowIndex],
//     },
//     text: 'Raw value',
//   };

//   let fieldDisplayValuesProxy: Record<string, DisplayValue> | undefined = undefined;

//   // If we have a dataFrame we can allow referencing other columns and their values in the interpolation.
//   if (dataFrame) {
//     fieldDisplayValuesProxy = getFieldDisplayValuesProxy({
//       frame: dataFrame,
//       rowIndex,
//     });

//     scopedVars['__data'] = {
//       value: {
//         name: dataFrame.name,
//         refId: dataFrame.refId,
//         fields: fieldDisplayValuesProxy,
//       },
//       text: 'Data',
//     };

//     if (dataFrame.meta?.type === DataFrameType.LogLines) {
//       const dataPlane = parseDataplaneLogsFrame(dataFrame);
//       const labels = dataPlane?.getLogFrameLabels();
//       if (labels != null) {
//         Object.entries(labels[rowIndex]).forEach((value) => {
//           scopedVars[value[0]] = {
//             value: value[1],
//           };
//         });
//       }
//     }

//     dataFrame.fields.forEach((f) => {
//       if (fieldDisplayValuesProxy && fieldDisplayValuesProxy[f.name]) {
//         scopedVars[f.name] = {
//           value: fieldDisplayValuesProxy[f.name],
//         };
//       }
//     });

//     // add this for convenience
//     scopedVars['__targetField'] = {
//       value: fieldDisplayValuesProxy[field.name],
//     };
//   }

//   const linksToProcess = options.linksToProcess || field.config.links;

//   if (linksToProcess) {
//     const links = linksToProcess.filter((link) => {
//       return DATA_LINK_FILTERS.every((filter) => filter(link, scopedVars));
//     });

//     const fieldLinks = links.map((link) => {
//       let internalLinkSpecificVars: ScopedVars = {};
//       if (link.meta?.transformations) {
//         link.meta?.transformations.forEach((transformation) => {
//           let fieldValue;
//           if (transformation.field) {
//             const transformField = dataFrame?.fields.find((field) => field.name === transformation.field);
//             fieldValue = transformField?.values[rowIndex];
//           } else {
//             fieldValue = field.values[rowIndex];
//           }

//           internalLinkSpecificVars = {
//             ...internalLinkSpecificVars,
//             ...getTransformationVars(transformation, fieldValue, field.name),
//           };
//         });
//       }

//       const allVars = { ...scopedVars, ...internalLinkSpecificVars };
//       const variableData = getVariableUsageInfo(link, allVars);
//       let variables: VariableInterpolation[] = [];

//       // if the link has no variables (static link), add it with the right key but an empty value so we know what field the static link is associated with
//       if (variableData.variables.length === 0) {
//         const fieldName = field.name.toString();
//         variables.push({ variableName: fieldName, value: '', match: '' });
//       } else {
//         variables = variableData.variables;
//       }
//       if (variableData.allVariablesDefined) {
//         if (!link.internal) {
//           const replace: InterpolateFunction = (value, vars) =>
//             getTemplateSrv().replace(value, { ...vars, ...allVars, ...scopedVars });

//           const linkModel = getLinkSrv().getDataLinkUIModel(link, replace, field);
//           if (!linkModel.title) {
//             linkModel.title = getTitleFromHref(linkModel.href);
//           }
//           linkModel.target = linkModel.target ?? '_blank';
//           return { ...linkModel, variables: variables };
//         } else {
//           const splitFnWithTracking = (options?: SplitOpenOptions<DataQuery>) => {
//             reportInteraction(DATA_LINK_USAGE_KEY, {
//               origin: link.origin || DataLinkConfigOrigin.Datasource,
//               app: CoreApp.Explore,
//               internal: true,
//             });

//             splitOpenFn?.(options);
//           };

//           const internalLink = mapInternalLinkToExplore({
//             link,
//             internalLink: link.internal,
//             scopedVars: allVars,
//             range,
//             field,
//             // Don't track internal links without split view as they are used only in Dashboards
//             onClickFn: options.splitOpenFn ? (options) => splitFnWithTracking(options) : undefined,
//             replaceVariables: getTemplateSrv().replace.bind(getTemplateSrv()),
//           });
//           return { ...internalLink, variables: variables };
//         }
//       } else {
//         return undefined;
//       }
//     });
//     return fieldLinks.filter((link): link is ExploreFieldLinkModel => !!link);
//   }
//   return [];
// };