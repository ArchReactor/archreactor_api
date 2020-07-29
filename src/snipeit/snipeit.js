const parseTools = (jsonString) => {
  let tools = JSON.parse(jsonString).rows;
  // return tools
  return tools.map((element) => {
    return snipeitToolToArchReactorTool(element);
  });
};

const snipeitToolToArchReactorTool = (element) => {
  let cost =
    element.purchase_cost === null ? 0 : parseFloat(element.purchase_cost);
  return {
    id: element.id,
    name: element.name,
    asset_tag: element.asset_tag,
    status: element.status_label.name,
    image: element.image,
    cost: cost,
    group_required: element.custom_fields.archreactor_group_id.value,
    checked_out: element.assigned_to,
  };
};

exports.snipeitToolToArchReactorTool = snipeitToolToArchReactorTool;
exports.parseTools = parseTools;
