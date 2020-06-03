import * as React from "react";
import {
  Flex,
  Icon,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  useColorMode
} from "@chakra-ui/core";
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";
import useConfig from "~/components/HyperglassProvider";
import Layout from "~/components/Layout";
import Table from "~/components/Table/index";

dayjs.extend(relativeTimePlugin);
dayjs.extend(utcPlugin);

const data = {
  vrf: "default",
  prefix: "1.1.1.0/24",
  count: 4,
  routes: [
    {
      active: true,
      age: 578857,
      weight: 170,
      med: 0,
      local_preference: 150,
      as_path: [1299, 13335],
      communities: [
        "1299:35000",
        "14525:0",
        "14525:40",
        "14525:1021",
        "14525:2840",
        "14525:3001",
        "14525:4001",
        "14525:9003"
      ],
      next_hop: "62.115.189.136",
      source_as: 13335,
      source_rid: "162.158.140.1",
      peer_rid: "2.255.254.51",
      rpki_state: 1
    },
    {
      active: false,
      age: 787213,
      weight: 170,
      med: 2020,
      local_preference: 150,
      as_path: [174, 13335],
      communities: [
        "174:21001",
        "174:22013",
        "14525:0",
        "14525:20",
        "14525:1021",
        "14525:2840",
        "14525:3001",
        "14525:4001",
        "14525:9001"
      ],
      next_hop: "100.64.0.122",
      source_as: 13335,
      source_rid: "162.158.140.1",
      peer_rid: "199.34.92.1",
      rpki_state: 0
    },
    {
      active: false,
      age: 616677,
      weight: 200,
      med: 0,
      local_preference: 150,
      as_path: [6939, 13335],
      communities: [
        "6939:7107",
        "6939:8840",
        "6939:9001",
        "14525:0",
        "14525:40",
        "14525:1021",
        "14525:2840",
        "14525:3002",
        "14525:4003",
        "14525:9002"
      ],
      next_hop: "100.64.0.122",
      source_as: 13335,
      source_rid: "172.68.129.1",
      peer_rid: "199.34.92.6",
      rpki_state: 2
    },
    {
      active: false,
      age: 1284244,
      weight: 200,
      med: 25090,
      local_preference: 150,
      as_path: [174, 13335],
      communities: [],
      next_hop: "100.64.0.122",
      source_as: 13335,
      source_rid: "108.162.239.1",
      peer_rid: "199.34.92.7",
      rpki_state: 3
    }
  ],
  winning_weight: "low"
};

const hiddenCols = ["active", "source_as"];

const isActiveColor = {
  true: { dark: "green.300", light: "green.500" },
  false: { dark: "gray.300", light: "gray.500" }
};

const arrowColor = {
  true: { dark: "blackAlpha.500", light: "blackAlpha.500" },
  false: { dark: "whiteAlpha.300", light: "blackAlpha.500" }
};

const rpkiIcon = ["not-allowed", "check-circle", "warning", "question"];

const rpkiColor = {
  true: {
    dark: ["red.500", "green.600", "yellow.500", "gray.800"],
    light: ["red.500", "green.500", "yellow.500", "gray.600"]
  },
  false: {
    dark: ["red.300", "green.300", "yellow.300", "gray.300"],
    light: ["red.400", "green.500", "yellow.400", "gray.500"]
  }
};

const makeColumns = fields => {
  return fields.map(pair => {
    const [header, accessor, align] = pair;
    let columnConfig = {
      Header: header,
      accessor: accessor,
      align: align,
      hidden: false
    };
    if (align === null) {
      columnConfig.hidden = true;
    }
    return columnConfig;
  });
};

const longestASNLength = asPath => {
  const longest = asPath.reduce((l, c) => {
    const strLongest = String(l);
    const strCurrent = String(c);
    return strCurrent.length > strLongest.length ? strCurrent : strLongest;
  });
  return longest.length;
};

const MonoField = ({ v, ...props }) => (
  <Text fontSize="sm" fontFamily="mono" {...props}>
    {v}
  </Text>
);

const Active = ({ isActive }) => {
  const { colorMode } = useColorMode();
  return (
    <Icon
      name={isActive ? "check-circle" : "warning"}
      color={isActiveColor[isActive][colorMode]}
    />
  );
};

const Age = ({ inSeconds }) => {
  const now = dayjs.utc();
  const then = now.subtract(inSeconds, "seconds");
  return (
    <Tooltip
      hasArrow
      label={then.toString().replace("GMT", "UTC")}
      placement="right"
    >
      <Text fontSize="sm">{now.to(then, true)}</Text>
    </Tooltip>
  );
};

const Weight = ({ weight, winningWeight }) => {
  const fixMeText =
    winningWeight === "low"
      ? "Lower Weight is Preferred"
      : "Higher Weight is Preferred";
  return (
    <Tooltip hasArrow label={fixMeText} placement="right">
      <Text fontSize="sm" fontFamily="mono">
        {weight}
      </Text>
    </Tooltip>
  );
};

const ASPath = ({ path, active, longestASN }) => {
  const { colorMode } = useColorMode();
  let paths = [];
  path.map((asn, i) => {
    const asnStr = String(asn);
    i !== 0 &&
      paths.push(
        <Icon
          name="chevron-right"
          key={`separator-${i}`}
          color={arrowColor[active][colorMode]}
        />
      );
    paths.push(
      <Text
        fontSize="sm"
        as="span"
        whiteSpace="pre"
        fontFamily="mono"
        key={`as-${asnStr}-${i}`}
      >
        {asnStr}
      </Text>
    );
  });
  return paths;
};

const Communities = ({ communities }) => {
  const { colorMode } = useColorMode();
  let component;
  communities.length === 0
    ? (component = (
        <Tooltip placement="right" hasArrow label="No Communities">
          <Icon name="question-outline" />
        </Tooltip>
      ))
    : (component = (
        <Popover trigger="hover" placement="right">
          <PopoverTrigger>
            <Icon name="view" />
          </PopoverTrigger>
          <PopoverContent
            textAlign="left"
            p={4}
            maxW="fit-content"
            color={colorMode === "dark" ? "white" : "black"}
          >
            <PopoverArrow />
            {communities.map(c => (
              <MonoField fontWeight="normal" v={c} key={c.replace(":", "-")} />
            ))}
          </PopoverContent>
        </Popover>
      ));
  return component;
};

const RPKIState = ({ state, active }) => {
  const { web } = useConfig();
  const { colorMode } = useColorMode();
  const stateText = [
    web.text.rpki_invalid,
    web.text.rpki_valid,
    web.text.rpki_unknown,
    web.text.rpki_unverified
  ];
  return (
    <Tooltip
      hasArrow
      placement="right"
      label={stateText[state] ?? stateText[3]}
    >
      <Icon
        name={rpkiIcon[state]}
        color={rpkiColor[active][colorMode][state]}
      />
    </Tooltip>
  );
};

const Cell = ({ data, rawData, longestASN }) => {
  const component = {
    active: <Active isActive={data.value} />,
    age: <Age inSeconds={data.value} />,
    weight: (
      <Weight weight={data.value} winningWeight={rawData.winning_weight} />
    ),
    med: <MonoField v={data.value} />,
    local_preference: <MonoField v={data.value} />,
    as_path: (
      <ASPath
        path={data.value}
        active={data.row.values.active}
        longestASN={longestASN}
      />
    ),
    communities: <Communities communities={data.value} />,
    next_hop: <MonoField v={data.value} />,
    source_as: <MonoField v={data.value} />,
    source_rid: <MonoField v={data.value} />,
    peer_rid: <MonoField v={data.value} />,
    rpki_state: <RPKIState state={data.value} active={data.row.values.active} />
  };
  return component[data.column.id] ?? <> </>;
};

const Structured = () => {
  const config = useConfig();
  const columns = makeColumns(config.parsed_data_fields);
  const allASN = data.routes.map(r => r.as_path).flat();
  const asLength = longestASNLength(allASN);

  return (
    <Layout>
      <Flex my={8} maxW={["100%", "100%", "75%", "50%"]} w="100%">
        <Table
          columns={columns}
          data={data.routes}
          rowHighlightProp="active"
          cellRender={d => (
            <Cell data={d} rawData={data} longestASN={asLength} />
          )}
          bordersHorizontal
          rowHighlightBg="green"
        />
      </Flex>
    </Layout>
  );
};

export default Structured;